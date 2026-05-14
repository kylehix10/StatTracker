import { useState, useEffect } from 'react';
import { createGame, getGames, getSeasons, getTeam, getTeams } from '../api';

function Games({ teamId }) {
  const [team, setTeam] = useState(null);
  const [teams, setTeams] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    seasonId: '',
    opponentTeamId: '',
    isHome: true
  });

  useEffect(() => {
    if (!teamId) {
      setError('Team ID is required');
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const [teamResponse, teamsResponse, gamesResponse, seasonsResponse] = await Promise.all([
          getTeam(teamId),
          getTeams(),
          getGames(),
          getSeasons()
        ]);

        const teamGames = gamesResponse.data.filter(g => g.homeTeamId === teamId || g.awayTeamId === teamId);

        setTeam(teamResponse.data);
        setTeams(teamsResponse.data.filter(t => t.id !== teamId));
        setGames(teamGames);
        setSeasons(seasonsResponse.data);

        setForm(current => ({
          ...current,
          seasonId: current.seasonId || seasonsResponse.data[0]?.id || '',
          opponentTeamId: current.opponentTeamId || teamsResponse.data.find(t => t.id !== teamId)?.id || ''
        }));
      } catch (err) {
        setError('Failed to load games data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [teamId]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm(current => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCreateGame = async (event) => {
    event.preventDefault();

    if (!form.date || !form.seasonId || !form.opponentTeamId) {
      setError('Date, season, and opponent are required');
      return;
    }

    const gameData = {
      date: form.date,
      seasonId: form.seasonId,
      homeTeamId: form.isHome ? teamId : form.opponentTeamId,
      awayTeamId: form.isHome ? form.opponentTeamId : teamId
    };

    try {
      setSaving(true);
      setError(null);
      const response = await createGame(gameData);
      setGames(current => [...current, response.data]);
    } catch (err) {
      setError('Failed to create game');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-danger">{error}</p>;
  if (!team) return <p>Team not found</p>;

  return (
    <div className="games">
      <h2>{team.name} Games</h2>

      <form onSubmit={handleCreateGame}>
        <label>
          Date
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Season
          <select name="seasonId" value={form.seasonId} onChange={handleChange} required>
            <option value="">Select a season</option>
            {seasons.map(season => (
              <option key={season.id} value={season.id}>{season.name}</option>
            ))}
          </select>
        </label>

        <label>
          Opponent
          <select name="opponentTeamId" value={form.opponentTeamId} onChange={handleChange} required>
            <option value="">Select an opponent</option>
            {teams.map(opponent => (
              <option key={opponent.id} value={opponent.id}>{opponent.name}</option>
            ))}
          </select>
        </label>

        <label>
          <input
            type="checkbox"
            name="isHome"
            checked={form.isHome}
            onChange={handleChange}
          />
          Home game
        </label>

        <button type="submit" disabled={saving}>
          {saving ? 'Creating...' : 'Create Game'}
        </button>
      </form>

      <ul>
        {games.map(game => (
          <li key={game.id}>
            {new Date(game.date).toLocaleDateString()} - {game.homeTeam?.name || game.homeTeamId} vs {game.awayTeam?.name || game.awayTeamId}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Games;
