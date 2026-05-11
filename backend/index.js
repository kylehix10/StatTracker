import express from 'express';
import cors from 'cors';
import 'dotenv/config';


import usersRouter from './routes/users.js';
import sportsRouter from './routes/sports.js';
import teamsRouter from './routes/teams.js';
import athletesRouter from './routes/athletes.js';
import seasonsRouter from './routes/seasons.js';
import gamesRouter from './routes/games.js';
import statsRouter from './routes/stats.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/users', usersRouter);
app.use('/api/sports', sportsRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/athletes', athletesRouter);
app.use('/api/seasons', seasonsRouter);
app.use('/api/games', gamesRouter);
app.use('/api/stats', statsRouter);

app.listen(5000, () => console.log('Server running on port 5000'));