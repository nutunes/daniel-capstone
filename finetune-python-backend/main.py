import os
import asyncio
from dotenv import load_dotenv
from prisma_client import Prisma

load_dotenv()

database_url = os.getenv("DATABASE_URL")

#Test function to ensure that prisma is connected successfully
async def main():
    db = Prisma()
    await db.connect()
    songs = await db.song.find_many()
    for i, _ in enumerate(songs, start=1):
        print(i)
    await db.disconnect()

if __name__ == "__main__": 
    asyncio.run(main())