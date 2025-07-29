from prisma_client import Prisma
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import numpy as np
from itertools import chain
from functools import partial

from regression.logistic_regression import run_user_regression, test_song

MAX_ATTEMPTS = 750
ODDS_THRESHOLD = 0.75
PLAYLIST_LENGTH = 30
instruments = ['cel', 'cla', 'flu', 'gac', 'gel', 'org', 'pia', 'sax', 'tru', 'vio', 'voi']


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

async def add_recommended_to_user(user_id, recommended):
    try:
        current_user = await prisma.user.find_unique(
            where={'id': user_id},
        )
        rec_ids = [song['id'] for song in recommended]
        updated_recent_ids = current_user.recentSongIds + rec_ids
        updated_user = await prisma.user.update(
            where={"id": user_id},
            data={
                "recommendedSongs": {
                    "connect": [{"id": rec_id} for rec_id in rec_ids]
                },
                "recentSongIds": updated_recent_ids
            }
        )
        return updated_user

    except Exception as e:
        print(f"Failed to add recommended songs to user {e}")
        return None


async def update_instrument_averages(instrument_values):
    try:
        recognition = await prisma.instrument_recognition.find_unique(
            where={
                'name': 'instrument_recognition'
            }
        )
        current_averages = recognition.instrument_average_values
        num_songs = await prisma.song.count()
        new_averages = ((current_averages[i]*(num_songs-1)+instrument_values[i])/num_songs for i in range(len(instrument_values)))
        updated_averages = await prisma.instrument_recognition.update(
            where={
                'name': 'instrument_recognition'
            },
            data={
                'instrument_average_values': new_averages,
            }
        )
    except Exception as e:
        print(f"Failed to update instrument averages {e}")


# This function calculates the l2, or Euclidean distance, between two vectors. A smaller distance correlates to similar vectors
# It takes a friend which is a user, gets its 
def l2_distance(friend_weights, user_weights):
    print(f"friend_weights: {friend_weights}\n user_weights: {user_weights}")
    if len(friend_weights) != len(user_weights):
        raise Exception('cannot computer l2 distance between two vectors of different length')
    np_friend_weights = np.array(friend_weights)
    np_user_weights = np.array(user_weights)
    diff_vec = np_friend_weights - np_user_weights
    return np.linalg.norm(diff_vec)


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
            w, e_in, means, stds = await run_user_regression(user)
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
async def recommend_song(user_id: str, cel: int, cla: int, flu: int, gac: int, gel: int, org: int, pia: int, sax: int, tru: int, vio: int, voi: int):
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
            w, e_in, means, stds = await run_user_regression(user)
            user = await add_regression_to_user(user_id, w, means, stds)
        w = user.regressionWeights
        means = user.featureMeans
        stds = user.featureStds

        desired_instruments = [cel, cla, flu, gac, gel, org, pia, sax, tru, vio, voi]
        recognition = await prisma.instrument_recognition.find_unique(
            where={'name': 'instrument_recognition'}
        )
        avg_instrument_values = recognition.instrument_average_values
        print(avg_instrument_values)
        
        # Make empty lists if doesn't exist so they can be chained together
        prev_recommended = user.recommendedSongs or []
        liked = user.likedSongs or []
        disliked = user.dislikedSongs or []

        # Construct a list of all songs to ignore when retrieving a song
        used = [song.id for song in chain(prev_recommended, liked, disliked)]
        for _ in range(MAX_ATTEMPTS):
            print('got new songs')
            rand_songs = await get_songs_not_in_list(used)
            for song in rand_songs:
                mfccs = song['mfccs']
                odds = test_song(w, mfccs, means, stds)
                if odds > ODDS_THRESHOLD:
                    song_instruments = song['instruments']
                    good_song = True
                    for i, val in enumerate(desired_instruments):
                        if val == 0:
                            # Want less of this instrument
                            if song_instruments[i] >= avg_instrument_values[i]:
                                print('too much')
                                good_song = False
                        elif val == 2:
                            # Want more of this instrument
                            if song_instruments[i] <= avg_instrument_values[i]:
                                print('not enough')
                                good_song = False
                    if good_song:
                        print(odds)
                        await add_recommended_to_user(user_id, [song])
                        return song

        return None
    
    
    except Exception as e:
        print(f"failed to run recommend song route {e}")
        return None


@app.get("/recommend_playlist")
async def recommend_playlist(user_id: str):
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
            w, e_in, means, stds = await run_user_regression(user)
            user = await add_regression_to_user(user_id, w, means, stds)
        w = user.regressionWeights
        means = user.featureMeans
        stds = user.featureStds
        
        # Make empty lists if doesn't exist so they can be chained together
        prev_recommended = user.recommendedSongs or []
        liked = user.likedSongs or []
        disliked = user.dislikedSongs or []
        used = [song.id for song in chain(prev_recommended, liked, disliked)]


        playlist = []
        for _ in range(MAX_ATTEMPTS):
            rand_songs = await get_songs_not_in_list(used)
            for song in rand_songs:
                mfccs = song['mfccs']
                odds = test_song(w, mfccs, means, stds)
                if odds > ODDS_THRESHOLD:
                    if song in playlist:
                        continue
                    playlist.append(song)
                    if len(playlist) >= PLAYLIST_LENGTH:
                        await add_recommended_to_user(user_id, playlist)
                        return playlist
                    
        # If here the playlist is incomplete - return it anyways
        return playlist



    except Exception as e:
        print(f"failed to run recommended song route {e}")
        return None
    


@app.get("/recommend_friends")
async def recommend_friends(user_id: str):
    try:
        user = await prisma.user.find_unique(
            where={"id": user_id}
        )
        if not user:
            raise Exception('User does not exist')
        
        user_weights = user.regressionWeights

        # Get max 1000 users from the db and sort them by music taste according to the user
        thousand_users_query = f'''
            Select * from "User"
            WHERE id != '{user_id}'
            ORDER BY RANDOM()
            LIMIT {1000}
        '''
        thousand_users = await prisma.query_raw(thousand_users_query)
        if not thousand_users:
            raise Exception('Failed to get users to sort')

        thousand_users_with_algorithm = [user for user in thousand_users if user['regressionWeights'] is not None]
        # Partial function of l2_distance fixing user weights, this will be used in sorting the friends array
        def dist_function(friend):
            return l2_distance(user_weights=user_weights, friend_weights=friend['regressionWeights'])
        
        sorted_users = sorted(thousand_users_with_algorithm, key=dist_function)
        return sorted_users[:5]

    except Exception as e:
        print(f"failed to run recommend friends route {e}")
        return None


@app.get("/add_instruments_to_song")
async def add_instruments_to_song(song_id: str):
    try:
        song = await prisma.song.find_unique(
            where={'id': song_id}
        )
        if not song:
            raise Exception('failed to get song')
        mfccs = song.mfccs
        instrument_classification = await prisma.instrument_recognition.find_unique(
            where={'name': 'instrument_recognition'}
        )
        weights_mat = instrument_classification.weights
        means_mat = instrument_classification.means
        stds_mat = instrument_classification.stds
        instrument_odds = []
        for w, means, stds in zip(weights_mat, means_mat, stds_mat):
            instrument_odds.append(test_song(w, mfccs, means, stds))
        updated_song = await prisma.song.update(
            where={'id': song_id},
            data={
                'instruments': instrument_odds,
            }
        )
        await update_instrument_averages(instrument_odds)
        return updated_song
    except Exception as e:
        print(f'failed to add instruments to song: {e}')






@app.get("/")
async def root():
    songs = await prisma.song.find_many(
        include={"likedBy": True, "dislikedBy": True}
    )
    return {"songs": songs}

