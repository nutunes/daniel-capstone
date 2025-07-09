from prisma_client import Prisma
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager


prisma = Prisma()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await prisma.connect()
    yield
    await prisma.disconnect()

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
@app.get("/")
async def root():
    songs = await prisma.song.find_many(
        include={"likedBy": True, "dislikedBy": True}
    )
    return {"songs": songs}


# #Test function to ensure that prisma is connected successfully
# async def main():
#     db = Prisma()
#     await db.connect()
#     songs = await db.song.find_many()
#     for i, _ in enumerate(songs, start=1):
#         print(i)
#     await db.disconnect()
#
# if __name__ == "__main__":
#     asyncio.run(main())