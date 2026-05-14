import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Modal } from 'react-bootstrap';
import { createGame, getSeasons, getTeams } from '../api';


function Dashboard() {
  const navigate = useNavigate();
  const [showCreateGame, setShowCreateGame] = useState(false);
  const [teams, setTeams] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    seasonId: '',
    homeTeamId: '',
    awayTeamId: ''
  });
  const [saving, setSaving] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [error, setError] = useState('');

  const loadGameOptions = useCallback(async () => {
    try {
      setLoadingOptions(true);
      setError('');

      const [teamsResponse, seasonsResponse] = await Promise.all([
        getTeams(),
        getSeasons()
      ]);

      setTeams(teamsResponse.data);
      setSeasons(seasonsResponse.data);
      setForm(current => ({
        ...current,
        seasonId: current.seasonId || seasonsResponse.data[0]?.id || '',
        homeTeamId: current.homeTeamId || teamsResponse.data[0]?.id || '',
        awayTeamId: current.awayTeamId || teamsResponse.data.find(team => team.id !== current.homeTeamId)?.id || ''
      }));
    } catch (err) {
      setError('Unable to load teams and seasons. Make sure the backend server is running.');
    } finally {
      setLoadingOptions(false);
    }
  }, []);

  useEffect(() => {
    loadGameOptions();
  }, [loadGameOptions]);

  const handleOpenCreateGame = () => {
    setShowCreateGame(true);
    loadGameOptions();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm(current => ({ ...current, [name]: value }));
  };

  const handleCreateGame = async (event) => {
    event.preventDefault();

    if (!form.date || !form.seasonId || !form.homeTeamId || !form.awayTeamId) {
      setError('Date, season, home team, and away team are required');
      return;
    }

    if (form.homeTeamId === form.awayTeamId) {
      setError('Home and away teams must be different');
      return;
    }

    try {
      setSaving(true);
      setError('');
      const response = await createGame(form);
      setShowCreateGame(false);
      navigate(`/record-stat/${response.data.id}`);
    } catch (err) {
      setError('Unable to create game');
    } finally {
      setSaving(false);
    }
  };

  return (
    <header className="Dashboard">
      <Button aria-label="Create game" onClick={handleOpenCreateGame}>
        <i className="bi-plus-circle-fill"></i>
      </Button>

      <Modal show={showCreateGame} onHide={() => setShowCreateGame(false)} centered>
        <Form onSubmit={handleCreateGame}>
          <Modal.Header closeButton>
            <Modal.Title>Create Game</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {error && <p className="text-danger">{error}</p>}

            <Form.Group className="mb-3" controlId="game-date">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="game-season">
              <Form.Label>Season</Form.Label>
              <Form.Select name="seasonId" value={form.seasonId} onChange={handleChange} disabled={loadingOptions} required>
                <option value="">{loadingOptions ? 'Loading seasons...' : 'Select a season'}</option>
                {seasons.map(season => (
                  <option key={season.id} value={season.id}>{season.name}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="game-home-team">
              <Form.Label>Home Team</Form.Label>
              <Form.Select name="homeTeamId" value={form.homeTeamId} onChange={handleChange} disabled={loadingOptions} required>
                <option value="">{loadingOptions ? 'Loading teams...' : 'Select a home team'}</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="game-away-team">
              <Form.Label>Away Team</Form.Label>
              <Form.Select name="awayTeamId" value={form.awayTeamId} onChange={handleChange} disabled={loadingOptions} required>
                <option value="">{loadingOptions ? 'Loading teams...' : 'Select an away team'}</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateGame(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || loadingOptions}>
              {saving ? 'Creating...' : 'Create Game'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </header>
  );
}

export default Dashboard;
