import numpy as np
import math
from .spotify import get_random_song

def array_contains(target, song_list):
    return any(song.id == target["id"] for song in song_list)


def format_data(liked, disliked):
    # Augment the disliked songs with random samples if there aren't enough
    # Maintain a 5:1 ratio liked:disliked so that we don't overwhelm with random songs, if disliked exceeds this ratio
    # that is good
    num_disliked = len(disliked)
    num_disliked_needed = math.floor(len(liked)/5)
    augmented_disliked = disliked.copy()

    for _ in range(num_disliked_needed-num_disliked):
        rand_song = get_random_song()
        while array_contains(rand_song, liked) or array_contains(rand_song, disliked):
            # Get a new random song if already in user's liked or disliked
            rand_song = get_random_song()
        augmented_disliked.append(rand_song)
        print("added random song")

    np_liked = np.vstack([song.mfccs for song in liked])
    np_disliked = np.vstack([song.mfccs for song in disliked])

    print(f"liked num: {len(liked)} disliked num: {len(augmented_disliked)}")