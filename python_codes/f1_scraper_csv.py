import os
import pandas as pd
from pymongo import MongoClient

mongo_uri = "mongodb://localhost:27017/"
db_name = "f1db"
client = MongoClient(mongo_uri)
db = client[db_name]

script_dir = os.path.dirname(os.path.abspath(__file__))

def load_csv(fname):
    path = os.path.join(script_dir, fname)
    print(f"Loading {path}")
    return pd.read_csv(path)

def upload_csv(filtered_df, collection_name):
    db[collection_name].delete_many({})
    records = filtered_df.to_dict(orient='records')
    if records:
        db[collection_name].insert_many(records)
    print(f"Uploaded {len(records)} records to '{collection_name}'")

# ---- Import ALL data ----

all_collections = [
    ("races.csv", "races"),
    ("seasons.csv", "seasons"),
    ("results.csv", "results"),
    ("lap_times.csv", "lap_times"),
    ("pit_stops.csv", "pit_stops"),
    ("qualifying.csv", "qualifying"),
    ("sprint_results.csv", "sprint_results"),
    ("driver_standings.csv", "driver_standings"),
    ("constructor_standings.csv", "constructor_standings"),
    ("constructor_results.csv", "constructor_results"),
    ("drivers.csv", "drivers"),
    ("constructors.csv", "constructors"),
    ("circuits.csv", "circuits"),
    ("status.csv", "status"),
]

for fname, cname in all_collections:
    df = load_csv(fname)
    upload_csv(df, cname)
