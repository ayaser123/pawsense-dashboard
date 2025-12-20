from ultralytics import YOLO
model = YOLO("best.pt")

def infer(video_path):

    # import pickle

    # with open("results.pkl", "rb") as f:
    #     results = pickle.load(f)
    results = model.predict(video_path, save=False, show=False)
    return results

