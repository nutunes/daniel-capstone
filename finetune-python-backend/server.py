from prisma_client import Prisma
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from regression.logistic_regression import run_user_regression, test_song

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
async def add_regression_to_user(user_id, w):
    try:
        w_list = w.flatten().tolist()
        updated_user = await prisma.user.update(
            where={"id": user_id},
            data={
                "regressionWeights": {
                    "set": w_list
                },
                "updateRegression": False
            }
        )
        return updated_user
    except Exception as e:
        print(f"error updating user: {e}")
        return None

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
            w, e_in = run_user_regression(user)
            user = await add_regression_to_user(user_id, w)
        w = user.regressionWeights
        
        song = await prisma.song.find_unique(
            where={"id": song_id},
        )
        if not song:
            raise Exception('failed to get song')
        mfccs = song.mfccs
        odds = test_song(w, mfccs)
        print(f"odds: {odds}")
        return odds

    except Exception as e:
        print(f"failed to run will i like route {e}")
        return None




@app.get("/")
async def root():
    songs = await prisma.song.find_many(
        include={"likedBy": True, "dislikedBy": True}
    )
    return {"songs": songs}

