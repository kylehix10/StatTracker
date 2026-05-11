

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

import users from './routes/users.js';
import sports from './routes/sports.js';
import teams from './routes/teams.js';
import athletes from './routes/athletes.js';
import seasons from './routes/seasons.js';
import games from './routes/games.js';
import stats from './routes/stats.js';

app.use('/api/users', users);
app.use('/api/sports', sports);
app.use('/api/teams', teams);
app.use('/api/athletes', athletes);
app.use('/api/seasons', seasons);
app.use('/api/games', games);
app.use('/api/stats', stats);

app.listen(5000, () => console.log('Server running on port 5000'));