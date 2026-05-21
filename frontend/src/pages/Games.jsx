import { useState, useEffect } from 'react';
import { createGame, getGames, getTeam } from '../api';

function Games({ teamId }) {
  const [team, setTeam] = useState(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    opponentName: '',
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

        const [teamResponse, gamesResponse] = await Promise.all([
          getTeam(teamId),
          getGames()
        ]);

        const teamGames = gamesResponse.data.filter(g => g.homeTeamId === teamId || g.awayTeamId === teamId);

        setTeam(teamResponse.data);
        setGames(teamGames);
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

    if (!form.date || !form.opponentName.trim()) {
      setError('Date and opponent are required');
      return;
    }

    const gameData = {
      date: form.date,
      homeTeamId: form.isHome ? teamId : null,
      awayTeamId: form.isHome ? null : teamId,
      opponentName: form.opponentName
    };

    try {
      setSaving(true);
      setError(null);
      const response = await createGame(gameData);
      setGames(current => [...current, response.data]);
      setForm(current => ({ ...current, opponentName: '' }));
    } catch (err) {
      setError('Failed to create game');
    } finally {
      setSaving(false);
    }
  };

  const getGameTeamName = (game, side) => {
    const teamName = game[`${side}Team`]?.name;
    const teamIdForSide = game[`${side}TeamId`];

    if (teamName) return teamName;
    if (!teamIdForSide) return game.opponentName || 'Opponent';
    return teamIdForSide;
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
          Opponent
          <input
            type="text"
            name="opponentName"
            value={form.opponentName}
            onChange={handleChange}
            required
          />
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
            {new Date(game.date).toLocaleDateString()} - {getGameTeamName(game, 'home')} vs {getGameTeamName(game, 'away')}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Games;
