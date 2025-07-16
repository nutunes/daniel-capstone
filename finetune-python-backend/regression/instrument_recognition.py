import numpy as np
import librosa
import glob
import os
import re



def create_features_and_labels():
    data_folder = '../IRMAS-TrainingData'
    instrument_folders = glob.glob(os.path.join(data_folder, '*/')) 
    instruments = ['cel', 'cla', 'flu', 'gac', 'gel', 'org', 'pia', 'sax', 'tru', 'vio', 'voi']
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
            #Librosa returns mfccs for each time series, I want average so get the mean
            mean_mfccs = np.mean(mfccs, axis=1)
            features.append(mean_mfccs)
    
    return np.array(labels), np.array(features)




if __name__ == '__main__':
    X, Y = create_features_and_labels()
    print(f'X: {X.shape} Y: {Y.shape}')
