import os
import numpy as np
from sklearn.neural_network import MLPClassifier
import joblib

def train_and_save():
    train_x_path = 'D:/finclusion-ai/Hedge-Fund-stock-market-analysis-master/training_set.csv'
    train_y_path = 'D:/finclusion-ai/Hedge-Fund-stock-market-analysis-master/training_labels.csv'
    test_x_path = 'D:/finclusion-ai/Hedge-Fund-stock-market-analysis-master/test_set.csv'
    test_y_path = 'D:/finclusion-ai/Hedge-Fund-stock-market-analysis-master/test_labels.csv'

    print("Loading Hedge Fund training features & labels...")
    train_x = np.loadtxt(train_x_path, delimiter=',', max_rows=12000)
    train_y = np.loadtxt(train_y_path, delimiter=',', max_rows=12000)

    test_x = np.loadtxt(test_x_path, delimiter=',', max_rows=2500)
    test_y = np.loadtxt(test_y_path, delimiter=',', max_rows=2500)

    print("Training 3-layer MLP Neural Network (64 -> 32 -> 16)...")
    clf = MLPClassifier(hidden_layer_sizes=(64, 32, 16), max_iter=30, random_state=42, early_stopping=True)
    clf.fit(train_x, train_y)

    acc = clf.score(test_x, test_y)
    print(f"MLP Test Accuracy: {acc * 100:.2f}%")

    out_dir = 'D:/finclusion-ai/backend/app/ml'
    os.makedirs(out_dir, exist_ok=True)
    model_path = os.path.join(out_dir, 'hedge_fund_mlp.joblib')
    joblib.dump(clf, model_path)
    print(f"Saved trained MLP model to {model_path}")

if __name__ == '__main__':
    train_and_save()
