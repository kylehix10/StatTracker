import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;
//const BASE = API_URL
  //? API_URL.replace(/\/$/, '')
 // : 'http://localhost:5000/api';


// Users
export const getUsers = () => axios.get(`${BASE}/users`);
export const getUser = (id) => axios.get(`${BASE}/users/${id}`);
export const createUser = (data) => axios.post(`${BASE}/users`, data);
export const loginUser = (data) => axios.post(`${BASE}/users/login`, data);
export const updateUser = (id, data) => axios.put(`${BASE}/users/${id}`, data);
export const deleteUser = (id) => axios.delete(`${BASE}/users/${id}`);

// Sports
export const getSports = () => axios.get(`${BASE}/sports`);
export const getSport = (id) => axios.get(`${BASE}/sports/${id}`);
export const createSport = (data) => axios.post(`${BASE}/sports`, data);
export const updateSport = (id, data) => axios.put(`${BASE}/sports/${id}`, data);
export const deleteSport = (id) => axios.delete(`${BASE}/sports/${id}`);

// Teams
export const getTeams = () => axios.get(`${BASE}/teams`);
export const getTeam = (id) => axios.get(`${BASE}/teams/${id}`);
export const createTeam = (data) => axios.post(`${BASE}/teams`, data);
export const updateTeam = (id, data) => axios.put(`${BASE}/teams/${id}`, data);
export const deleteTeam = (id) => axios.delete(`${BASE}/teams/${id}`);

// Athletes
export const getAthletes = () => axios.get(`${BASE}/athletes`);
export const createAthlete = (data) => axios.post(`${BASE}/athletes`, data);
export const addAthleteToTeam = (id, data) => axios.post(`${BASE}/athletes/${id}/teams`, data);
export const updateAthlete = (id, data) => axios.put(`${BASE}/athletes/${id}`, data);
export const deleteAthlete = (id) => axios.delete(`${BASE}/athletes/${id}`);

// Seasons
export const getSeasons = () => axios.get(`${BASE}/seasons`);
export const getSeason = (id) => axios.get(`${BASE}/seasons/${id}`);
export const createSeason = (data) => axios.post(`${BASE}/seasons`, data);
export const updateSeason = (id, data) => axios.put(`${BASE}/seasons/${id}`, data);
export const deleteSeason = (id) => axios.delete(`${BASE}/seasons/${id}`);

// Games
export const getGames = () => axios.get(`${BASE}/games`);
export const getGame = (id) => axios.get(`${BASE}/games/${id}`);
export const createGame = (data) => axios.post(`${BASE}/games`, data);
export const updateGame = (id, data) => axios.put(`${BASE}/games/${id}`, data);
export const deleteGame = (id) => axios.delete(`${BASE}/games/${id}`);

// Stats
export const getStatsByGame = (gameId) => axios.get(`${BASE}/stats/game/${gameId}`);
export const getStatsByAthlete = (athleteId) => axios.get(`${BASE}/stats/athlete/${athleteId}`);
export const createStat = (data) => axios.post(`${BASE}/stats`, data);
export const updateStat = (id, data) => axios.put(`${BASE}/stats/${id}`, data);
export const deleteStat = (id) => axios.delete(`${BASE}/stats/${id}`);
