import numpy as np
import math
from .spotify import get_random_song

def format_data(liked, disliked):
    np_liked = np.vstack([song.mfccs for song in liked])
    np_disliked = np.vstack([song.mfccs for song in disliked])

    # Augment the disliked songs with random samples if there aren't enough
    # Maintain a 3:1 ratio liked:disliked so that we don't overwhelm with random songs, if disliked exceeds this ratio
    # that is good
    num_disliked = np_disliked.shape[0]
    num_disliked_needed = math.floor(np_liked.shape[0]/3)

    for i in range(num_disliked_needed-num_disliked):
        get_random_song()