from prisma_client import Prisma
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from utils.format_data import format_data
from regression.logistic_regression import run

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
@app.get("/will_i_like")
async def will_i_like(user_id: str, song_id: str):
    #Test if a user will like a song
    print('will i like called')


@app.get("/run_regression")
async def run_regression(user_id: str):
    user = await prisma.user.find_unique(
        where={"id": user_id},
        include={
            "dislikedSongs": True,
            "likedSongs": True,
        }
    )
    formatted_data = format_data(liked=user.likedSongs, disliked=user.dislikedSongs)
    run(formatted_data)
    return {"user": user}


@app.get("/")
async def root():
    songs = await prisma.song.find_many(
        include={"likedBy": True, "dislikedBy": True}
    )
    return {"songs": songs}

