import numpy as np
import math
from prisma_client import Prisma
import asyncio

prisma = Prisma()


async def get_random_songs(num_songs):
    try:
        await prisma.connect()    
        query = f'''
            Select * from "Song"
            ORDER BY RANDOM()
            LIMIT {num_songs}
        '''
        songs = await prisma.query_raw(query)
        await prisma.disconnect()
        return songs
    except Exception as e:
        print(f"failed to get random songs {e}")
        return None



def array_contains(target, song_list):
    return any(song.id == target["id"] for song in song_list)


async def format_data(liked, disliked):
    # Augment the disliked songs with random samples if there aren't enough
    # Maintain a 5:1 ratio liked:disliked so that we don't overwhelm with random songs, if disliked exceeds this ratio
    # that is good
    num_disliked = len(disliked)
    ratio = math.floor(len(liked)/2)
    num_disliked_needed = ratio if ratio > 1 else 1

    augmented_disliked = await get_random_songs(num_disliked_needed - num_disliked)

    np_liked = np.vstack([song.mfccs for song in liked])
    ones = np.ones((np_liked.shape[0], 1))
    np_liked = np.hstack((np_liked, ones))
    if disliked:
        np_disliked = np.vstack(([song.mfccs for song in disliked], [song["mfccs"] for song in augmented_disliked]))
    else:
        np_disliked = np.vstack([song["mfccs"] for song in augmented_disliked])
    neg_ones = -1 * np.ones((np_disliked.shape[0],1))
    np_disliked = np.hstack((np_disliked, neg_ones))

    formatted_matrix = np.vstack((np_liked, np_disliked))
    return formatted_matrix



if __name__ == "__main__":
    print(asyncio.run(get_random_songs(1)))