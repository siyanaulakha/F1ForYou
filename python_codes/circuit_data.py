import pandas as pd
import json

# Load the CSVs
circuits = pd.read_csv('circuits.csv')
races = pd.read_csv('races.csv')
results = pd.read_csv('results.csv')
drivers = pd.read_csv('drivers.csv')

# Create driver full name map for lookup
drivers['driverName'] = drivers['forename'].fillna('') + ' ' + drivers['surname'].fillna('')
driver_map = drivers.set_index('driverId')['driverName'].to_dict()

def convert_types(obj):
    """Recursively convert pandas/numpy types to native Python types for JSON serialization."""
    if isinstance(obj, dict):
        return {k: convert_types(v) for k, v in obj.items()}
    elif pd.api.types.is_datetime64_any_dtype(type(obj)):
        return str(obj)
    elif hasattr(obj, 'item'):
        return obj.item()
    else:
        return obj

circuit_info = {}

for idx, row in circuits.iterrows():
    circuit_id = row['circuitId']
    circuit_data = row.to_dict()

    # Get all raceIds for this circuit
    race_ids = races[races['circuitId'] == circuit_id]['raceId'].tolist()

    # Filter results for these races
    results_here = results[results['raceId'].isin(race_ids)]

    # Number of races held at this circuit
    num_races = len(race_ids)

    # Driver with most wins at this circuit
    winner_rows = results_here[results_here['positionOrder'] == 1]
    win_counts = winner_rows['driverId'].value_counts()
    if not win_counts.empty:
        most_wins_driver_id = win_counts.idxmax()
        most_wins_driver = driver_map.get(most_wins_driver_id, str(most_wins_driver_id))
        most_wins_count = win_counts.max()
    else:
        most_wins_driver = None
        most_wins_count = 0

    # Fastest lap time and driver
    fastest_lap_rows = results_here.dropna(subset=['fastestLapTime'])
    if not fastest_lap_rows.empty:
        fastest_row = fastest_lap_rows.loc[fastest_lap_rows['fastestLapTime'].idxmin()]
        fastest_lap_time = fastest_row['fastestLapTime']
        fastest_lap_driver_id = fastest_row['driverId']
        fastest_lap_driver = driver_map.get(fastest_lap_driver_id, str(fastest_lap_driver_id))
    else:
        fastest_lap_time = None
        fastest_lap_driver = None

    # Most successful team (constructor)
    if 'constructorId' in winner_rows:
        team_win_counts = winner_rows['constructorId'].value_counts()
        if not team_win_counts.empty:
            most_successful_team_id = int(team_win_counts.idxmax())
            most_successful_team_wins = int(team_win_counts.max())
        else:
            most_successful_team_id = None
            most_successful_team_wins = 0
    else:
        most_successful_team_id = None
        most_successful_team_wins = 0

    circuit_data.update({
        'num_races': int(num_races),
        'most_wins_driver': most_wins_driver,
        'driver_win_count': int(most_wins_count),
        'fastest_lap': fastest_lap_time,
        'fastest_lap_driver': fastest_lap_driver,
        'most_successful_team_id': most_successful_team_id,
        'team_win_count': most_successful_team_wins
    })
    circuit_info[circuit_id] = circuit_data

with open('enriched_circuits.json', 'w') as f:
    json.dump(convert_types(circuit_info), f, indent=2)

# Optional: print first two circuits info to verify
print(json.dumps({k: circuit_info[k] for k in list(circuit_info.keys())[:2]}, indent=2))
