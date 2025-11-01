import os
import pandas as pd
from pymongo import MongoClient

# MongoDB setup
mongo_uri = "mongodb://localhost:27017/"
db_name = "f1db"
client = MongoClient(mongo_uri)
db = client[db_name]

# Ensure working in script directory
script_dir = os.path.dirname(os.path.abspath(__file__))

def load_csv(fname):
    path = os.path.join(script_dir, fname)
    print(f"Loading {path}")
    return pd.read_csv(path)

def upload_csv(filtered_df, collection_name):
    db[collection_name].delete_many({})  # Optional: Clear out old records
    records = filtered_df.to_dict(orient='records')
    if records:
        db[collection_name].insert_many(records)
    print(f"Uploaded {len(records)} records to '{collection_name}'")

# 1. Filter races (for year 2020-2024)
races = load_csv("races.csv")
filtered_races = races[races['year'].between(2020, 2024)]
race_ids = set(filtered_races['raceId'])
upload_csv(filtered_races, 'races')

# 2. Filter seasons
seasons = load_csv("seasons.csv")
filtered_seasons = seasons[seasons['year'].between(2020, 2024)]
upload_csv(filtered_seasons, 'seasons')

# 3. Event tables filtered by raceId (only events for filtered races)
event_files = [
    ("results.csv", "results"),
    ("lap_times.csv", "lap_times"),
    ("pit_stops.csv", "pit_stops"),
    ("qualifying.csv", "qualifying"),
    ("sprint_results.csv", "sprint_results"),
    ("driver_standings.csv", "driver_standings"),
    ("constructor_standings.csv", "constructor_standings"),
    ("constructor_results.csv", "constructor_results"),
]

for fname, cname in event_files:
    df = load_csv(fname)
    if 'raceId' in df.columns:
        filt_df = df[df['raceId'].isin(race_ids)]
        upload_csv(filt_df, cname)
    else:
        upload_csv(df, cname)  # In case a file is not linked by raceId

# 4. Reference tables uploaded in full (needed for relations)
reference_files = [
    ("drivers.csv", "drivers"),
    ("constructors.csv", "constructors"),
    ("circuits.csv", "circuits"),
    ("status.csv", "status"),
]
for fname, cname in reference_files:
    df = load_csv(fname)
    upload_csv(df, cname)
