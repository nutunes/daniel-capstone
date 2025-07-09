import numpy as np # used to have vectorized operations that are very fast
import pandas as pd # likely will be used for data matrix creation and manipulation
from scipy.stats import zscore # will be used to normalize the input data which helps the algorithm converge


def cleanData():
    #TODO: implement data cleaning
    print("Cleaning data...")

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
    log_vec = np.array([log_sum_exp_trick(np.array([0, zi])) for zi in z]) #Calculate cross entropy error for each feature
    return np.mean(log_vec)


# This function returns the probability that a sample is positive
# It takes as parameters:
# w - weight vector that encodes the bias - the trained model
# x - a single feature vector/data point
#
# It returns the calculated probability of the data point belonging to the positive class through the sigmoid function
def sigmoid(w, x):
    dot = np.dot(w, x)
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
    errors = 0
    if len(X) != len(y):
        print('Length mismatch')
        return None
    for xi, yi in zip(X, y):
        prob = sigmoid(w, xi)
        prediction = 1 if prob > 0.5 else -1
        if prediction != yi:
            errors += 1
    return errors/len(X)


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
    denom = 1 + exponent_vec

    # must broadcast in order to have division result we want
    broadcast_numerator = y[:, np.newaxis] * X #forces y to a 1 dimensional column vector
    broadcast_denominator = denom[:, np.newaxis] #forces denom to a 1 dimensional column vector

    frac = broadcast_numerator/broadcast_denominator #Reults in a matrix same size as X
    gradient = -np.mean(frac, axis=0) #calculate the average for each column (average down the 0 axis)
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
def logistic_reg(X, y, w_init, max_its, eta, terminating_condition):
    t = 0
    w = w_init
    for i in range(max_its):
        gradient_ein = compute_gradient(w, X, y)
        w = w - eta * gradient_ein
        t+=1
        infinity_norm = np.linalg.norm(gradient_ein, np.inf)
        if infinity_norm <= terminating_condition:
            break
    e_in = find_test_error(w, X, y)
    return t, w, e_in