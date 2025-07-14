from prisma_client import Prisma
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import numpy as np
from itertools import chain

from regression.logistic_regression import run_user_regression, test_song

MAX_ATTEMPTS = 20
ODDS_THRESHOLD = 0.75

prisma = Prisma()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await prisma.connect()
    print("database connected")
    yield
    await prisma.disconnect()
    print("database disconnected")

app = FastAPI(lifespan=lifespan)

origins = [
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper functions
async def add_regression_to_user(user_id, w, means, stds):
    try:
        w_list = w.flatten().tolist()
        means_list = means.flatten().tolist()
        stds_list = stds.flatten().tolist()
        updated_user = await prisma.user.update(
            where={"id": user_id},
            data={
                "regressionWeights": {
                    "set": w_list
                },
                "featureMeans": {
                    "set": means_list
                },
                "featureStds": {
                    "set": stds_list
                },
                "updateRegression": False
            }
        )
        return updated_user
    except Exception as e:
        print(f"error updating user: {e}")
        return None
    

async def get_songs_not_in_list(ignore):
    try: 
        if ignore:
            placeholders = ', '.join([f'${i+1}' for i in range(len(ignore))])
            query = f'''
                Select * from "Song"
                WHERE id NOT IN ({placeholders})
                ORDER BY RANDOM()
                LIMIT 40;
            '''
            return await prisma.query_raw(query, *ignore)
        else:
            query = f'''
                Select * from "Song"
                ORDER BY RANDOM()
                LIMIT 40;
            '''
            return await prisma.query_raw(query)
    except Exception as e:
        print(f"failed to get song to recommend {e}")
        return []



# Routes
@app.get("/will_i_like")
async def will_i_like(user_id: str, song_id: str):
    # Test if a user will like a song
    try:
        user = await prisma.user.find_unique(
            where={"id": user_id},
            include={
                "dislikedSongs": True,
                "likedSongs": True,
            }
        )
        if not user:
            raise Exception('failed to get user')
        if user.updateRegression:
            w, e_in, means, stds = run_user_regression(user)
            user = await add_regression_to_user(user_id, w, means, stds)
        w = user.regressionWeights
        means = user.featureMeans
        stds = user.featureStds
        
        song = await prisma.song.find_unique(
            where={"id": song_id},
        )
        if not song:
            raise Exception('failed to get song')
        mfccs = song.mfccs
        
        odds = test_song(w, mfccs, means, stds)
        return odds

    except Exception as e:
        print(f"failed to run will i like route {e}")
        return None
    
    
@app.get("/recommend_song")
async def recommend_song(user_id: str):
    try:
        user = await prisma.user.find_unique(
            where={"id": user_id},
            include={
                "recommendedSongs": True,
                "dislikedSongs": True,
                "likedSongs": True,
            }
        )
        if not user:
            raise Exception('failed to get user')
        if user.updateRegression:
            w, e_in, means, stds = run_user_regression(user)
            user = await add_regression_to_user(user_id, w, means, stds)
        w = user.regressionWeights
        means = user.featureMeans
        stds = user.featureStds
        
        # Make empty lists if doesn't exist so they can be chained together
        prev_recommended = user.recommendedSongs or []
        liked = user.likedSongs or []
        disliked = user.dislikedSongs or []

        # Construct a list of all songs to ignore when retrieving a song
        used = [song.id for song in chain(prev_recommended, liked, disliked)]
        for _ in range(MAX_ATTEMPTS):
            rand_songs = await get_songs_not_in_list(used)
            for song in rand_songs:
                mfccs = song['mfccs']
                odds = test_song(w, mfccs, means, stds)
                if odds > ODDS_THRESHOLD:
                    return song
    

    except Exception as e:
        print(f"failed to run recommend song route {e}")




@app.get("/")
async def root():
    songs = await prisma.song.find_many(
        include={"likedBy": True, "dislikedBy": True}
    )
    return {"songs": songs}

