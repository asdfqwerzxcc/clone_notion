def normalize_data(data):
    # Function to normalize input data
    return (data - data.mean()) / data.std()

def calculate_accuracy(predictions, labels):
    # Function to calculate accuracy of predictions
    correct = (predictions == labels).sum()
    return correct / len(labels)

def save_model(model, filepath):
    # Function to save the trained model to a file
    import joblib
    joblib.dump(model, filepath)

def load_model(filepath):
    # Function to load a trained model from a file
    import joblib
    return joblib.load(filepath)