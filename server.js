import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import axios from 'axios';

const app = express();
app.use(cors());

const uri = 'mongodb://localhost:27017/';
const dbName = 'f1db';

const client = new MongoClient(uri);

async function getSeasonWinner(db, raceId) {
  // Winning driver
  const ds = await db.collection('driver_standings').findOne({ raceId, position: 1 });
  const driver = ds ? await db.collection('drivers').findOne({ driverId: ds.driverId }) : null;
  const driverWinner = driver ? `${driver.forename} ${driver.surname}` : null;

  // Winning constructor
  const cs = await db.collection('constructor_standings').findOne({ raceId, position: 1 });
  const constructor = cs ? await db.collection('constructors').findOne({ constructorId: cs.constructorId }) : null;
  const constructorWinner = constructor ? constructor.name : null;

  return { driverWinner, constructorWinner };
}

// 1. List all seasons (years)
app.get('/api/seasons', async (req, res) => {
  try {
    await client.connect();
    const db = client.db(dbName);
    const seasons = await db.collection('seasons').find({ year: { $gte: 2020, $lte: 2024 } }).sort({ year: 1 }).toArray();
    res.json(seasons.map(s => s.year));
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  } 
});

// 2. Season details including winners and races
app.get('/api/seasons/:year/details', async (req, res) => {
  const year = parseInt(req.params.year);
  try {
    await client.connect();
    const db = client.db(dbName);

    const races = await db.collection('races').find({ year }).sort({ round: 1 }).toArray();
    if (races.length == 0) return res.status(404).json({ error: 'Season not found' });

    const lastRaceId = races[races.length - 1].raceId;
    const { driverWinner, constructorWinner } = await getSeasonWinner(db, lastRaceId);

    // Simplify races for frontend
    const raceSummaries = races.map(r => ({
      raceId: r.raceId,
      name: r.name,
      date: r.date
    }));

    res.json({ year, driverWinner, constructorWinner, races: raceSummaries });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 3. Detailed race standings + season driver + constructor standings
app.get('/api/races/:raceId/standings', async (req, res) => {
  const raceId = parseInt(req.params.raceId);
  try {
    await client.connect();
    const db = client.db(dbName);

    // Get race
    const race = await db.collection('races').findOne({ raceId });
    if (!race) return res.status(404).json({ error: 'Race not found' });

    // Race results: join driver and constructor info
    const results = await db.collection('results')
      .find({ raceId })
      .sort({ positionOrder: 1 })
      .toArray();

    // Populate driver and constructor names in results
    const detailedResults = await Promise.all(results.map(async (r) => {
    const driver = await db.collection('drivers').findOne({ driverId: r.driverId });
    const constructor = await db.collection('constructors').findOne({ constructorId: r.constructorId });

    // Correct join on statusId, not _id!
    const statusRecord = await db.collection('status').findOne({ statusId: r.statusId });
    const statusDescription = statusRecord ? statusRecord.status : null;

    return {
        position: r.positionOrder,
        driver: driver ? `${driver.forename} ${driver.surname}` : null,
        constructor: constructor ? constructor.name : null,
        points: r.points,
        laps: r.laps,
        status: statusDescription
    };
    }));


    // Get season standings for the race year
    const driverStandings = await db.collection('driver_standings')
      .find({ raceId })
      .sort({ position: 1 })
      .toArray();

    const detailedDriverStandings = await Promise.all(driverStandings.map(async (ds) => {
      const driver = await db.collection('drivers').findOne({ driverId: ds.driverId });
      return {
        position: ds.position,
        driver: driver ? `${driver.forename} ${driver.surname}` : null,
        points: ds.points,
        wins: ds.wins
      };
    }));

    const constructorStandings = await db.collection('constructor_standings')
      .find({ raceId })
      .sort({ position: 1 })
      .toArray();

    const detailedConstructorStandings = await Promise.all(constructorStandings.map(async (cs) => {
      const constructor = await db.collection('constructors').findOne({ constructorId: cs.constructorId });
      return {
        position: cs.position,
        constructor: constructor ? constructor.name : null,
        points: cs.points,
        wins: cs.wins
      };
    }));

    res.json({
      race: {
        raceId,
        name: race.name,
        date: race.date,
        results: detailedResults,
      },
      driverStandings: detailedDriverStandings,
      constructorStandings: detailedConstructorStandings
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/seasons/:year/standings-history', async (req, res) => {
  const year = parseInt(req.params.year);
  try {
    await client.connect();
    const db = client.db(dbName);

    const races = await db.collection('races')
      .find({ year })
      .sort({ round: 1 })
      .toArray();

    // For each race, get driver/contructor standings
    const driverStandingsHistory = await Promise.all(races.map(async (race) => {
      const standings = await db.collection('driver_standings')
        .find({ raceId: race.raceId })
        .sort({ position: 1 })
        .toArray();
      const standingsWithNames = await Promise.all(standings.map(async (s) => {
        const driver = await db.collection('drivers').findOne({ driverId: s.driverId });
        return {
          driver: driver ? `${driver.forename} ${driver.surname}` : null,
          position: s.position,
          points: s.points
        };
      }));
      return {
        raceId: race.raceId,
        raceName: race.name,
        round: race.round,
        standings: standingsWithNames
      };
    }));

    // Similar for constructors
    const constructorStandingsHistory = await Promise.all(races.map(async (race) => {
      const standings = await db.collection('constructor_standings')
        .find({ raceId: race.raceId })
        .sort({ position: 1 })
        .toArray();
      const standingsWithNames = await Promise.all(standings.map(async (s) => {
        const constructor = await db.collection('constructors').findOne({ constructorId: s.constructorId });
        return {
          constructor: constructor ? constructor.name : null,
          position: s.position,
          points: s.points
        };
      }));
      return {
        raceId: race.raceId,
        raceName: race.name,
        round: race.round,
        standings: standingsWithNames
      };
    }));

    res.json({ driverStandingsHistory, constructorStandingsHistory });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/drivers', async (req, res) => {
  try {
    await client.connect();
    const db = client.db(dbName);

    // 1. Find all races in the latest season you have (2024)
    const latestSeason = 2024;
    const racesLatest = await db.collection('races').find({ year: latestSeason }).toArray();
    const raceIdsLatest = racesLatest.map(race => race.raceId);

    // 2. Find all drivers who participated in 2024
    const resultsLatest = await db.collection('results').find({ raceId: { $in: raceIdsLatest } }).toArray();
    const currentDriverIds = [...new Set(resultsLatest.map(r => r.driverId))];

    // 3. Get career data for only these drivers (no year/raceId filter after here!)
    const drivers = await db.collection('drivers').find({ driverId: { $in: currentDriverIds } }).toArray();

    // Get all data (career-long) for these drivers
    const [allResults, allQual, allDriverStandings, allConstructors, allRaces] = await Promise.all([
      db.collection('results').find({ driverId: { $in: currentDriverIds } }).toArray(),
      db.collection('qualifying').find({ driverId: { $in: currentDriverIds } }).toArray(),
      db.collection('driver_standings').find({ driverId: { $in: currentDriverIds } }).toArray(),
      db.collection('constructors').find({}).toArray(),
      db.collection('races').find({}).toArray()
    ]);

    // Prepare mapping raceId -> year
    const raceIdToYear = {};
    allRaces.forEach(r => { raceIdToYear[r.raceId] = r.year; });

    const driverData = drivers.map(driver => {
      const dResults = allResults.filter(r => r.driverId === driver.driverId);
      const dQual = allQual.filter(q => q.driverId === driver.driverId);

      // Races participated
      const racesCount = new Set(dResults.map(r => r.raceId)).size;
      // Wins
      const wins = dResults.filter(r => r.positionOrder === 1).length;
      // Podiums
      const podiums = dResults.filter(r => [1,2,3].includes(r.positionOrder)).length;
      // Poles
      const poles = dQual.filter(q => q.position === 1).length;
      // Teams across career
      const teamIds = [...new Set(dResults.map(r => r.constructorId))];
      const teams = teamIds.map(tid => {
        const t = allConstructors.find(c => c.constructorId === tid);
        return t ? t.name : null;
      }).filter(Boolean);

      // Championships: count # of seasons where driver was P1 in standings at last race of season
      const seasons = [...new Set(dResults.map(r => raceIdToYear[r.raceId]).filter(Boolean))];
      let championships = 0;
      for (const season of seasons) {
        const seasonRaces = allRaces.filter(r => r.year === season).sort((a, b) => b.round - a.round);
        if (seasonRaces.length === 0) continue;
        const lastRaceId = seasonRaces[0].raceId;
        const championStanding = allDriverStandings.find(s => s.raceId === lastRaceId && s.driverId === driver.driverId && s.position === 1);
        if (championStanding) championships += 1;
      }

      // Career points (last known in standings)
      const latestStanding = allDriverStandings
        .filter(s => s.driverId === driver.driverId)
        .sort((a, b) => b.raceId - a.raceId)[0];
      const careerPoints = latestStanding ? latestStanding.points : dResults.reduce((sum, r) => sum + (r.points || 0), 0);

      const seasonsList = [...new Set(dResults.map(r => raceIdToYear[r.raceId]).filter(Boolean))].sort();

      return {
        id: driver.driverId,
        name: `${driver.forename} ${driver.surname}`,
        code: driver.code,
        dob: driver.dob,
        nationality: driver.nationality,
        races: racesCount,
        wins,
        podiums,
        poles,
        championships,
        teams,
        points: careerPoints,
        seasons: seasonsList, 
        number: driver.number
      };
    });

    res.json(driverData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    await client.close();
  }
});

app.get('/api/constructors', async (req, res) => {
  try {
    await client.connect();
    const db = client.db(dbName);

    // Get all races and determine the latest season
    const allRaces = await db.collection('races').find({}).toArray();
    if (allRaces.length === 0) {
      return res.json([]);
    }
    const latestSeason = Math.max(...allRaces.map(r => r.year));
    const latestRaceIds = allRaces.filter(r => r.year === latestSeason).map(r => r.raceId);

    // Get all relevant collections
    const [constructors, allConstructorResults, allConstructorStandings, allDrivers, latestResults] = await Promise.all([
      db.collection('constructors').find({}).toArray(),
      db.collection('constructor_results').find({}).toArray(),
      db.collection('constructor_standings').find({}).toArray(),
      db.collection('drivers').find({}).toArray(),
      db.collection('results').find({ raceId: { $in: latestRaceIds } }).toArray()
    ]);

    // For raceId -> year mapping
    const raceIdToYear = {};
    allRaces.forEach(r => { raceIdToYear[r.raceId] = r.year; });

    const constructorData = constructors.map(constructor => {
      const cResults = allConstructorResults.filter(r => r.constructorId === constructor.constructorId);
      const seasons = [...new Set(cResults.map(r => raceIdToYear[r.raceId]).filter(Boolean))];

      // Wins and points (total)
      const wins = cResults.filter(r => r.positionOrder === 1).length;
      const points = cResults.reduce((sum, r) => sum + (r.points || 0), 0);

      // Championships: count #seasons where team was P1 in last race of the season
      let championships = 0;
      seasons.forEach(season => {
        const seasonRaces = allRaces.filter(r => r.year === season).sort((a, b) => b.round - a.round);
        if (!seasonRaces.length) return;
        const lastRaceId = seasonRaces[0].raceId;
        const champStanding = allConstructorStandings.find(s =>
          s.raceId === lastRaceId && s.constructorId === constructor.constructorId && s.position === 1
        );
        if (champStanding) championships++;
      });

      // DRIVERS: Only current drivers (raced for this team in latest season)
      const currentDriverIdsSet = new Set(
        latestResults
          .filter(r => r.constructorId === constructor.constructorId)
          .map(r => r.driverId)
      );
      const drivers = allDrivers
        .filter(d => currentDriverIdsSet.has(d.driverId))
        .map(d => `${d.forename} ${d.surname}`);

      return {
        id: constructor.constructorId,
        name: constructor.name,
        nationality: constructor.nationality,
        championships,
        wins,
        points,
        drivers,
      };
    });

    res.json(constructorData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    await client.close();
  }
});

app.get('/api/circuits', async (req, res) => {
  try {
    await client.connect();
    const db = client.db(dbName);
    const circuits = await db.collection('circuits').find({}).toArray();
    res.json(circuits); // If collection exists, send as array
  } catch (err) {
    console.error("Circuits API error:", err); // Watch your terminal for this log!
    res.status(500).json({ error: 'Could not fetch circuits', details: err.message });
  } finally {
    await client.close();
  }
});


app.get('/api/circuits/:circuitId/details', async (req, res) => {
  const circuitId = Number(req.params.circuitId); // Make sure this matches the type in your DB

  function toSeconds(val) {
    if (typeof val === 'string') {
      const m = val.match(/^(?:(\d+):)?(\d+(?:\.\d+)?)/);
      if (m) {
        const minutes = parseInt(m[1] || '0', 10);
        const seconds = parseFloat(m[2]);
        return minutes * 60 + seconds;
      }
      const f = parseFloat(val);
      return isNaN(f) ? null : f;
    }
    if (typeof val === 'number') {
      return val;
    }
    return null;
  }

  try {
    await client.connect();
    const db = client.db(dbName);

    const circuit = await db.collection('circuits').findOne({ circuitId: circuitId });

    // Get all races at this circuit
    const races = await db.collection('races').find({ circuitId: circuitId }).toArray();
    const raceIds = races.map(r => r.raceId);

    // Gather lap_times for these races
    const lapTimesRaw = await db.collection('lap_times').find({ raceId: { $in: raceIds } }).toArray();
    const lapTimeSecs = lapTimesRaw.map(lt => toSeconds(lt.lapTime)).filter(n => n != null);

    // Calculate avg and fastest lap
    const avgLapTime = lapTimeSecs.length ? lapTimeSecs.reduce((a, b) => a + b, 0) / lapTimeSecs.length : null;
    const fastestLapTime = lapTimeSecs.length ? Math.min(...lapTimeSecs) : null;
    let fastestLapDriver = null;
    if (fastestLapTime !== null) {
      const fastestLap = lapTimesRaw.find(lt => toSeconds(lt.lapTime) === fastestLapTime);
      if (fastestLap) {
        const driver = await db.collection('drivers').findOne({ driverId: fastestLap.driverId });
        fastestLapDriver = driver ? `${driver.forename} ${driver.surname}` : null;
      }
    }

    // Most wins at circuit
    const winsResults = await db.collection('results').find({ raceId: { $in: raceIds }, position: 1 }).toArray();
    const winCounts = {};
    winsResults.forEach(r => {
      winCounts[r.driverId] = (winCounts[r.driverId] || 0) + 1;
    });
    let mostWinsDriver = null;
    let mostWinsCount = 0;
    for (const [driverId, count] of Object.entries(winCounts)) {
      if (count > mostWinsCount) {
        mostWinsCount = count;
        mostWinsDriver = driverId;
      }
    }
    let mostWinsDriverName = null;
    if (mostWinsDriver) {
      const driver = await db.collection('drivers').findOne({ driverId: Number(mostWinsDriver) });
      mostWinsDriverName = driver ? `${driver.forename} ${driver.surname}` : null;
    }

    res.json({
      circuit: {
        circuitId: circuit?.circuitId ?? circuitId,
        name: circuit?.name ?? "Unknown",
        location: circuit?.location,
        country: circuit?.country,
        lat: circuit?.lat,
        lng: circuit?.lng,
        alt: circuit?.alt,
        url: circuit?.url
      },
      stats: {
        averageLapTime: avgLapTime,
        fastestLap: fastestLapTime,
        fastestDriver: fastestLapDriver,
        mostWinsDriver: mostWinsDriverName,
        mostWinsCount: mostWinsCount,
        totalRaces: races.length
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  } finally {
    await client.close();
  }
});


const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
