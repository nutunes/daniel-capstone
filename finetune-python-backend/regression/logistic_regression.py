import numpy as np # used to have vectorized operations that are very fast
from concurrent.futures import ProcessPoolExecutor
from utils.format_data import format_data
import time


# This function splits a data matrix into protions for training and testing by randomly shuffling the data points
# and dividing them according to the desired ratio. The standard ratio is 80% training and 20% testing
def train_test_split(data, ratio=0.8, seed=None):
    # If seed, the random number is the same across all runs with the same seed. This is for testing
    rng = np.random.default_rng(seed) 
    # Get a random permutation of integers from 0 to the number of rows - 1
    # These will serve as the random indices that create the split
    shuffled_indices = rng.permutation(data.shape[0])
    # Get the index that generates the split you want
    split_index = int(data.shape[0]*ratio)
    
    train_indices = shuffled_indices[:split_index]
    test_indices = shuffled_indices[split_index:]

    train_data = data[train_indices]
    test_data = data[test_indices]
    return train_data, test_data


# This function splits a data matrix into k smaller matrices that are randomly produced from rows of
# the data matrix. It is used in k-fold cross validation
# 
# This function returns a list of tuples that contain the train X, train y, test X, and test y, 
# normalized, so that they don't have to be recalculated each time you change the hyperparameters
def split_into_folds(data, num_folds=5, seed=None):
    rng = np.random.default_rng(seed)

    shuffled_indices = rng.permutation(data.shape[0])

    folds = np.array_split(shuffled_indices, num_folds)

    splits = []
    for i, val_fold in enumerate(folds):
        val_data = data[val_fold]
        train_indices = np.concatenate(folds[:i] + folds[i+1:])
        train_data = data[train_indices]
        # Get labels and normalized features for train and validation data
        train_X, train_y, val_X, val_y, _, _ = extract_features_and_normalize(train_data, val_data)
        splits.append((train_X, train_y, val_X, val_y))
        
    return splits


# Does not implement any testing/validation sets
def organize_data(data):
    # Split into features and labels
    X = data[:, :-1]
    y = data[:,-1].reshape(-1,1)

    # Normalize X by making each column have mean 0 and standard deviation 1
    # This helps with algorithm convergence
    means = np.mean(X, axis=0)
    stds = np.std(X, axis=0)
    X = (X - means) / stds


    # Deal with bias by adding a column of 1s to X
    bias = np.ones((X.shape[0], 1))
    X = np.hstack((bias, X))
    return X, y, means, stds


# This function splits training and testing data into features and labels, and normalizes the features
# according to the training data
def extract_features_and_normalize(train_data, test_data):
    train_X = train_data[:, :-1]
    train_y = train_data[:, -1].reshape(-1, 1)
    test_X = test_data[:, :-1]
    test_y = test_data[:, -1].reshape(-1, 1)

    train_means = np.mean(train_X, axis=0)
    train_stds = np.std(train_X, axis=0)

    train_X = (train_X - train_means)/train_stds
    # Normalize the test data by the means and standard deviations of the training data so that it 
    # can accurately estimate out of sample error
    test_X = (test_X - train_means)/train_stds

    # Deal with bias by adding a column of 1s to X
    train_bias = np.ones((train_X.shape[0], 1))
    test_bias = np.ones((test_X.shape[0], 1))
    train_X = np.hstack((train_bias, train_X))
    test_X = np.hstack((test_bias, test_X))
    

    return train_X, train_y, test_X, test_y, train_means, train_stds


# This function calculates the Log-Sum-Exp trick which avoids overflow/underflow when raising numbers to high
# powers and calculating the log of them
# It takes as parameters:
# x - a vector which contains the values you are summing over after applying the exponential function
#
# It returns the logarithm of the sum of the exponential of each element in the input vector x but in a safe way
# that is not prone to overflow or underflow
def log_sum_exp_trick(x):
    m = np.max(x)
    return m + np.log(np.sum(np.exp(x-m)))


# This function calculates the average cross entropy error over the dataset
# It takes as parameters:
# w - weight vector at the current step in the algorithm
# X - training data matrix
# y - training label vector
#
# This function returns a value which is the average cross-entropy error that the trained model creates across all
# data points.
def find_test_error(w, X, y):
    dot_vec = np.dot(X, w)
    z = -y*dot_vec
    log_vec = np.array([log_sum_exp_trick(np.array([0, zi])) for zi in z.flat]) #Calculate cross entropy error for each feature
    return np.mean(log_vec)


# This function returns the probability that a sample is positive
# It takes as parameters:
# w - weight vector that encodes the bias - the trained model
# x - a single feature vector/data point
#
# It returns the calculated probability of the data point belonging to the positive class through the sigmoid function
def sigmoid(w, x):
    dot = np.dot(w.T, x)
    denom = 1 + np.exp(-1*dot)
    return 1/denom


# This function calculates the average binary error of the dataset by testing if the model says that the probability
# of being positive is over 50% or not.
# It takes as parameters:
# w - weight vector that encodes the bias - the trained model
# X - training data matrix
# y - training labels vector
#
# This function returns a value which is the proportion of datapoints that are inaccurately classified
def calculate_binary_error(w, X, y):
    dot_vec = np.dot(X, w)
    probs = 1 / (1+np.exp(-1*dot_vec)) # This calculates the sigmoid on all samples in a vectorized manner
    preds = np.where(probs > 0.5, 1, -1)
    error = np.mean(preds.flatten() != y.flatten())
    return error



# This function computes the gradient of the cross-entropy error which is used to tell the model where to go next
# It takes as parameters:
# w - weight vector at the current step in the algorithm
# X - training data matrix
# y - training labels vector
#
# This function returns a vector encoding the gradient of the error for each feature
def compute_gradient(w, X, y):
    #Vector with the dot product of each input vector with w
    #Results in an N dimensional vector - one dot product for every sample
    dot_vec = np.dot(X, w)

    exponent_vec = np.exp(y * dot_vec)
    denominator = 1 + exponent_vec
    numerator = y * X


    frac = numerator/denominator #Reults in a matrix same size as X
    #calculate the average for each column (average down the 0 axis) and reshape to force it to be a column vector
    gradient = -np.mean(frac, axis=0).reshape(-1, 1)
    return gradient


# This function runs the logistic regression with the following parameters:
# X - training data matrix
# y - training labels vector
# max_its - the maximum number of iterations the algorithm will run for
# eta - the size of "step" the algorithm will take at each step
# terminating_condition - when the algorithm should stop - decides what is "good enough"
#
# This function returns the number of iterations taken, the resulting weight vector, and the in-sample error
# that the resulting weight vector creates.
def logistic_reg(X, y, w_init, max_its=10**4, eta=3.5, terminating_condition=10**-6):
    t = 0
    w = w_init
    for i in range(max_its):
        gradient_ein = compute_gradient(w, X, y)
        w -= eta * gradient_ein
        t+=1
        infinity_norm = np.linalg.norm(gradient_ein, np.inf)
        if infinity_norm <= terminating_condition:
            break
    e_in = find_test_error(w, X, y)
    return t, w, e_in


# This function runs k-fold cross validation on the logistic regression. It goes through all combinations of hyperparameters
# specified below, runs k-fold cross validation to estimate the out of sample error by splitting up the training data into 
# 5 portions and training on 4 while validating on the fifth for each portion. It then calculates the average error across all 5
# validated portions and records the hyperparameters that minimized it. Finally, once the ideal hyperparameters have been found it 
# trains a model on the entire training data using these ideal hyperparameters, calculates the testing error using the test set, 
# and reports this final weight vector and test error. 
def run_k_fold_cross_validation_regression(data, num_folds=5, seed=None):
    start_time = time.time()
    train, test = train_test_split(data, seed=seed) # Take out 20% of data to be used for testing
    print('made train test split')

    #Define hyperparameter values that you are going to optimize among
    etas = [0.01, 0.1, 1, 3, 4, 5]
    terminating_conditions = [10**-3, 10**-4, 10**-5]
    max_its = [10**3, 10**4]

    #Optimal values that you are going to find as the algorithm runs
    best_eta = None
    best_terminating_condition = None
    best_max_its = None
    best_error = None

    folds = split_into_folds(train, num_folds=num_folds, seed=seed) # Split training data into folds

    #Define hyperparameter grid to pass to parallelization helper function
    param_grid = [(eta, terminating_condition, max_it, folds) for eta in etas for terminating_condition in terminating_conditions for max_it in max_its]

    with ProcessPoolExecutor() as executor:
        results = list(executor.map(test_hyperparams, param_grid))
    
    for avg_e_val, eta, terminating_condition, max_it in results:
        if best_error is None or avg_e_val < best_error:
            best_eta = eta
            best_terminating_condition = terminating_condition
            best_max_its = max_it
            best_error = avg_e_val
    
    # Once here, hyperparameters are ideal. Now run the model on the entire training set with these ideal
    # hyperparameters and then test using the reserved testing set. This is an unbiased estimator of the 
    # out of sample error
    train_X, train_y, test_X, test_y, train_means, train_stds = extract_features_and_normalize(train, test)
    w_init = np.zeros((train_X.shape[1], 1))
    t, w, e_in = logistic_reg(X=train_X, y=train_y, w_init=w_init, max_its=best_max_its, eta=best_eta, terminating_condition=best_terminating_condition)
    e_test = find_test_error(w, test_X, test_y)
    bin_e_test = calculate_binary_error(w, test_X, test_y)
    end_time = time.time()
    time_diff = end_time - start_time
    print(time_diff)
    return w, e_test, bin_e_test, train_means, train_stds


# This function runs k fold cross validation with a single set of hyperparameters. It returns the average error on each validation set. It is used so that
# hyperparameter testing can run in parallel, greatly increasing algorithm efficiency.
def test_hyperparams(params):
    eta, terminating_condition, max_it, folds = params
    errors = []
    for fold in folds:
        train_X, train_y, val_X, val_y = fold
        w_init = np.zeros((train_X.shape[1], 1))
        t, w, e_in = logistic_reg(X=train_X, y=train_y, w_init=w_init, max_its=max_it, eta=eta, terminating_condition=terminating_condition)
        e_val = find_test_error(w, val_X, val_y)
        errors.append(e_val)
    avg_e_val = np.mean(errors)
    return avg_e_val, eta, terminating_condition, max_it



# This function is used to update a user's regression algorithm for song recommendation
async def run_user_regression(user):
    formatted_data = await format_data(liked=user.likedSongs, disliked=user.dislikedSongs)
    w, e_test, bin_e_test, means, stds = run_k_fold_cross_validation_regression(formatted_data)
    return w, e_test, means, stds


# This function takes a song (mfcc vector) and a user's algorithm (weight vector) and calculates
# the odds of the user liking the song
def test_song(w, x, means, stds):
    x = np.array(x)
    means = np.array(means)
    stds = np.array(stds)
    x_standardized = (x - means) / stds

    x_bias = np.insert(x_standardized, 0, 1)
    w_np = np.array(w).reshape(-1, 1)
    x_np = x_bias.reshape(-1, 1)
    odds = sigmoid(w_np, x_np)
    return float(odds)