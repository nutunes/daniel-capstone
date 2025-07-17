import numpy as np
import librosa
import glob
import os
import re
from regression.logistic_regression import run_k_fold_cross_validation_regression
from prisma_client import Prisma
import asyncio
import json

prisma = Prisma()


instruments = ['cel', 'cla', 'flu', 'gac', 'gel', 'org', 'pia', 'sax', 'tru', 'vio', 'voi']


def create_data_matrix():
    data_folder = 'IRMAS-TrainingData'
    instrument_folders = glob.glob(os.path.join(data_folder, '*/')) 
    
    # Dictionary mapping the instrument strings to their index in the instruments array
    instrument_to_index = {inst: i for i, inst in enumerate(instruments)}
    labels = []
    features = []
    for subdir in instrument_folders:
        wav_files = glob.glob(subdir + '*.wav')
        for track in wav_files:
            # Extract present instruments to create the label vector
            tags = re.findall(r'\[(.*?)\]', track)
            present_instruments = [tag for tag in tags if tag in instruments]
            label_vector = -1 * np.ones(len(instruments))
            for inst in present_instruments:
                label_vector[instrument_to_index[inst]] = 1
            labels.append(label_vector)
            # Now use librosa to get mfccs for each .wav file
            y, sr = librosa.load(track, sr=44100) # IRMAS sampled at 44.1kHz
            mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
            #Librosa returns mfccs for each time series, I want average so get the mean down each column
            mean_mfccs = np.mean(mfccs, axis=1)
            features.append(mean_mfccs)
    
    return np.array(features), np.array(labels)


def run_instrument_recognition():
    features, labels = create_data_matrix()
    w_matrix = []
    means_matrix = []
    stds_matrix = []
    print('done creating data matrix')
    for column in range(labels.shape[1]):
        # instrument_label is the vector containing the labels for each point for a single instrument
        instrument_labels = labels[:, column].reshape(-1, 1)
        data = np.hstack((features, instrument_labels))
        w, e_test, bin_e_test, means, stds = run_k_fold_cross_validation_regression(data)
        print(f'test error: {e_test} bin error: {bin_e_test}')
        print(f'w shape: {w.shape}')
        w_matrix.append(w.flatten().tolist())
        means_matrix.append(means.tolist())
        stds_matrix.append(stds.tolist())
    return w_matrix, means_matrix, stds_matrix


async def upload_to_database():
    w_matrix, means_matrix, stds_matrix = run_instrument_recognition()
    # Convert to JSON directly
    weights_json = json.dumps(w_matrix)
    means_json = json.dumps(means_matrix)
    stds_json = json.dumps(stds_matrix)
    await prisma.connect()
    await prisma.instrument_recognition.create(
        data={
            'name': 'instrument_recognition',
            'instruments': instruments,
            'weights': weights_json,
            'means': means_json,
            'stds': stds_json,
        }
    )
    await prisma.disconnect()



if __name__ == '__main__':
    asyncio.run(upload_to_database())