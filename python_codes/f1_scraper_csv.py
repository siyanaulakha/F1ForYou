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

# 1. Load key CSVs
races = load_csv("races.csv")
results = load_csv("results.csv")
drivers = load_csv("drivers.csv")

# 2. Identify current drivers (those in 2024 results)
current_year = 2024
races_2024 = races[races['year'] == current_year]
race_ids_2024 = set(races_2024['raceId'])
results_2024 = results[results['raceId'].isin(race_ids_2024)]
current_driver_ids = set(results_2024['driverId'])

# 3. For each current driver, find earliest year in results/races
driver_earliest_year = {}
for driver_id in current_driver_ids:
    driver_races = results[results['driverId'] == driver_id]
    if not driver_races.empty:
        race_years = races.set_index('raceId').loc[driver_races['raceId']]['year']
        rookie_year = race_years.min()
        driver_earliest_year[driver_id] = rookie_year

# 4. Keep data since the earliest rookie year
min_rookie_year = min(driver_earliest_year.values())
print(f"Earliest 'rookie year' among current drivers: {min_rookie_year}")

# 5. Filter races, seasons, and event tables
filtered_races = races[races['year'] >= min_rookie_year]
race_ids = set(filtered_races['raceId'])
upload_csv(filtered_races, 'races')

seasons = load_csv("seasons.csv")
filtered_seasons = seasons[seasons['year'] >= min_rookie_year]
upload_csv(filtered_seasons, 'seasons')

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
        upload_csv(df, cname)

reference_files = [
    ("drivers.csv", "drivers"),
    ("constructors.csv", "constructors"),
    ("circuits.csv", "circuits"),
    ("status.csv", "status"),
]
for fname, cname in reference_files:
    df = load_csv(fname)
    upload_csv(df, cname)
