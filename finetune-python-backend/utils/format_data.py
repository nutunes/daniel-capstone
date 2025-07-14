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
    ratio = math.floor(len(liked)/5)
    num_disliked_needed = ratio if ratio < 20 else 20
    augmented_disliked = []

    for _ in range(num_disliked_needed-num_disliked):
        rand_song = get_random_song()
        while array_contains(rand_song, liked) or array_contains(rand_song, disliked):
            # Get a new random song if already in user's liked or disliked
            rand_song = get_random_song()
        augmented_disliked.append(rand_song)
        print("added random song")

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