import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';

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


const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
