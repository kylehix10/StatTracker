import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Form, ListGroup, Modal, Tab, Table, Tabs, Toast, ToastContainer } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { addAthleteToTeam, createAthlete, createGame, deleteAthlete, deleteGame, getGames, getSeasons, getStatsByGame, getTeam } from '../api';

const STAT_COLUMNS = [
  { key: 'completions', label: 'Comp' },
  { key: 'passAttempts', label: 'Att' },
  { key: 'passingYards', label: 'Pass Yds' },
  { key: 'passingTds', label: 'Pass TD' },
  { key: 'thrownInterceptions', label: 'INT' },
  { key: 'carries', label: 'Car' },
  { key: 'rushingYards', label: 'Rush Yds' },
  { key: 'rushingTouchdowns', label: 'Rush TD' },
  { key: 'receptions', label: 'Rec' },
  { key: 'receivingYards', label: 'Rec Yds' },
  { key: 'receivingTds', label: 'Rec TD' },
  { key: 'tackles', label: 'Tkl' },
  { key: 'sacks', label: 'Sack' },
  { key: 'passDeflections', label: 'PD' },
  { key: 'interceptions', label: 'Def INT' },
  { key: 'forcedFumbles', label: 'FF' }
];

function Season() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('games');
  const [team, setTeam] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [games, setGames] = useState([]);
  const [statTotalsByAthlete, setStatTotalsByAthlete] = useState({});
  const [showCreateGame, setShowCreateGame] = useState(false);
  const [showCreateAthlete, setShowCreateAthlete] = useState(false);
  const [gameForm, setGameForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    seasonId: '',
    opponentName: '',
    isHome: true
  });
  const [athleteForm, setAthleteForm] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState('');
  const [pendingRemoval, setPendingRemoval] = useState(null);
  const [error, setError] = useState('');

  const loadTeamSeason = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [teamResponse, gamesResponse, seasonsResponse] = await Promise.all([
        getTeam(teamId),
        getGames(),
        getSeasons()
      ]);

      const teamGames = gamesResponse.data.filter(game => (
        game.homeTeamId === teamId || game.awayTeamId === teamId
      ));
      const rosterAthleteIds = new Set(
        teamResponse.data.roster.map(row => row.athlete.id)
      );
      const statsResponses = await Promise.all(
        teamGames.map(game => getStatsByGame(game.id))
      );
      const totals = {};

      statsResponses.flatMap(response => response.data).forEach(stat => {
        if (!rosterAthleteIds.has(stat.athleteId)) return;

        totals[stat.athleteId] = totals[stat.athleteId] || {};
        STAT_COLUMNS.forEach(column => {
          totals[stat.athleteId][column.key] = (
            (totals[stat.athleteId][column.key] || 0) + (stat[column.key] || 0)
          );
        });
      });

      setTeam(teamResponse.data);
      setSeasons(seasonsResponse.data);
      setGames(teamGames);
      setStatTotalsByAthlete(totals);
      setGameForm(current => ({
        ...current,
        seasonId: current.seasonId || seasonsResponse.data[0]?.id || ''
      }));
    } catch (err) {
      setError('Unable to load season');
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    loadTeamSeason();
  }, [loadTeamSeason]);

  const roster = useMemo(() => {
    return team?.roster?.map(row => row.athlete) || [];
  }, [team]);

  const getGameTeamName = (game, side) => {
    const teamName = game[`${side}Team`]?.name;
    const teamIdForSide = game[`${side}TeamId`];

    if (teamName) return teamName;
    if (!teamIdForSide) return game.opponentName || 'Opponent';
    return teamIdForSide;
  };

  const handleGameChange = (event) => {
    const { name, value, type, checked } = event.target;
    setGameForm(current => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAthleteChange = (event) => {
    const { name, value } = event.target;
    setAthleteForm(current => ({ ...current, [name]: value }));
  };

  const handleCreateGame = async (event) => {
    event.preventDefault();

    if (!gameForm.date || !gameForm.seasonId || !gameForm.opponentName.trim()) {
      setError('Date, season, and opponent are required');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await createGame({
        date: gameForm.date,
        seasonId: gameForm.seasonId,
        homeTeamId: gameForm.isHome ? teamId : null,
        awayTeamId: gameForm.isHome ? null : teamId,
        opponentName: gameForm.opponentName
      });
      setShowCreateGame(false);
      setGameForm(current => ({
        ...current,
        opponentName: ''
      }));
      await loadTeamSeason();
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to create game');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateAthlete = async (event) => {
    event.preventDefault();

    if (!athleteForm.firstName || !athleteForm.lastName) {
      setError('First name and last name are required');
      return;
    }

    try {
      setSaving(true);
      setError('');
      const athleteResponse = await createAthlete({
        firstName: athleteForm.firstName,
        lastName: athleteForm.lastName,
        dateOfBirth: athleteForm.dateOfBirth || null
      });
      await addAthleteToTeam(athleteResponse.data.id, {
        teamId,
        startDate: new Date().toISOString().slice(0, 10)
      });
      setShowCreateAthlete(false);
      setAthleteForm({
        firstName: '',
        lastName: '',
        dateOfBirth: ''
      });
      await loadTeamSeason();
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to create athlete');
    } finally {
      setSaving(false);
    }
  };

  const handleRequestRemoveGame = (event, game) => {
    event.stopPropagation();
    setError('');
    setPendingRemoval({
      id: game.id,
      type: 'game',
      label: `${getGameTeamName(game, 'home')} vs ${getGameTeamName(game, 'away')}`
    });
  };

  const handleRequestRemoveAthlete = (athlete) => {
    setError('');
    setPendingRemoval({
      id: athlete.id,
      type: 'player',
      label: `${athlete.firstName} ${athlete.lastName}`
    });
  };

  const handleCancelRemoval = () => {
    if (!removingId) {
      setPendingRemoval(null);
    }
  };

  const handleConfirmRemoval = async () => {
    if (!pendingRemoval) {
      return;
    }

    try {
      setRemovingId(pendingRemoval.id);
      setError('');
      if (pendingRemoval.type === 'game') {
        await deleteGame(pendingRemoval.id);
      } else {
        await deleteAthlete(pendingRemoval.id);
      }
      setPendingRemoval(null);
      await loadTeamSeason();
    } catch (err) {
      setError(err.response?.data?.error || `Unable to remove ${pendingRemoval.type}`);
    } finally {
      setRemovingId('');
    }
  };

  if (loading) return <p className="season-page">Loading season...</p>;
  if (error && !team) return <p className="season-page text-danger">{error}</p>;
  if (!team) return <p className="season-page">Team not found</p>;

  return (
    <main className="season-page">
      <header className="season-header">
        <h1>{team.name}</h1>
        <p>{team.town} {team.level} - {team.sport?.name || 'Sport'} - {team.year}</p>
      </header>

      <div className="season-actions">
        {activeTab === 'games' ? (
          <Button onClick={() => setShowCreateGame(true)}>
            <i className="bi bi-plus-circle-fill"></i>
            <span>Create Game</span>
          </Button>
        ) : (
          <Button onClick={() => setShowCreateAthlete(true)}>
            <i className="bi bi-plus-circle-fill"></i>
            <span>Create Athlete</span>
          </Button>
        )}
      </div>

      <Tabs activeKey={activeTab} onSelect={(key) => setActiveTab(key || 'games')} id="season-tabs" className="mb-3">
        <Tab eventKey="games" title="Games">
          {games.length === 0 ? (
            <p className="empty-state">No games have been created for this team.</p>
          ) : (
            <ListGroup>
              {games.map(game => (
                <ListGroup.Item
                  key={game.id}
                  action
                  as="div"
                  className="season-game-row"
                  onClick={() => navigate(`/record-stat/${game.id}`, { state: { teamId } })}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      navigate(`/record-stat/${game.id}`, { state: { teamId } });
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div>
                    <strong>{new Date(game.date).toLocaleDateString()}</strong>
                    <span>{game.season?.name}</span>
                  </div>
                  <div>
                    {getGameTeamName(game, 'home')} vs {getGameTeamName(game, 'away')}
                  </div>
                  <Button
                    aria-label="Remove game"
                    className="season-remove-button"
                    disabled={removingId === game.id}
                    onClick={(event) => handleRequestRemoveGame(event, game)}
                    onKeyDown={(event) => event.stopPropagation()}
                    size="sm"
                    type="button"
                    variant="outline-danger"
                  >
                    Remove
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Tab>

        <Tab eventKey="roster" title="Roster">
          {roster.length === 0 ? (
            <p className="empty-state">No athletes are on this roster yet.</p>
          ) : (
            <div className="stat-table-wrap">
              <Table striped bordered hover responsive className="stat-table">
                <thead>
                  <tr>
                    <th>Athlete</th>
                    {STAT_COLUMNS.map(column => (
                      <th key={column.key}>{column.label}</th>
                    ))}
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {roster.map(athlete => {
                    const totals = statTotalsByAthlete[athlete.id] || {};
                    return (
                      <tr key={athlete.id}>
                        <th scope="row">{athlete.firstName} {athlete.lastName}</th>
                        {STAT_COLUMNS.map(column => (
                          <td key={column.key}>{totals[column.key] || 0}</td>
                        ))}
                        <td>
                          <Button
                            aria-label={`Remove ${athlete.firstName} ${athlete.lastName}`}
                            disabled={removingId === athlete.id}
                            onClick={() => handleRequestRemoveAthlete(athlete)}
                            size="sm"
                            type="button"
                            variant="outline-danger"
                          >
                            Remove
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </Tab>
      </Tabs>

      <ToastContainer className="dashboard-toast-container" position="top-end">
        <Toast show={Boolean(pendingRemoval)} onClose={handleCancelRemoval} bg="light">
          <Toast.Header closeButton={!removingId}>
            <strong className="me-auto">Are you sure you want to delete?</strong>
          </Toast.Header>
          <Toast.Body>
            {pendingRemoval && <p className="mb-3">{pendingRemoval.label}</p>}
            <div className="delete-toast-actions">
              <Button
                disabled={Boolean(removingId)}
                onClick={handleConfirmRemoval}
                size="sm"
                variant="danger"
              >
                {removingId ? 'Deleting...' : 'Yes'}
              </Button>
              <Button
                disabled={Boolean(removingId)}
                onClick={handleCancelRemoval}
                size="sm"
                variant="secondary"
              >
                No
              </Button>
            </div>
          </Toast.Body>
        </Toast>
      </ToastContainer>

      <Modal show={showCreateGame} onHide={() => setShowCreateGame(false)} centered>
        <Form onSubmit={handleCreateGame}>
          <Modal.Header closeButton>
            <Modal.Title>Create Game</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {error && <p className="text-danger">{error}</p>}

            <Form.Group className="mb-3" controlId="season-game-date">
              <Form.Label>Date</Form.Label>
              <Form.Control
                name="date"
                onChange={handleGameChange}
                required
                type="date"
                value={gameForm.date}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="season-game-season">
              <Form.Label>Season</Form.Label>
              <Form.Select name="seasonId" value={gameForm.seasonId} onChange={handleGameChange} required>
                <option value="">Select a season</option>
                {seasons.map(season => (
                  <option key={season.id} value={season.id}>{season.name}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="season-game-opponent">
              <Form.Label>Opponent</Form.Label>
              <Form.Control
                name="opponentName"
                onChange={handleGameChange}
                placeholder="Opponent name"
                required
                type="text"
                value={gameForm.opponentName}
              />
            </Form.Group>

            <Form.Check
              checked={gameForm.isHome}
              label="Home game"
              name="isHome"
              onChange={handleGameChange}
              type="checkbox"
            />
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateGame(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Creating...' : 'Create Game'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showCreateAthlete} onHide={() => setShowCreateAthlete(false)} centered>
        <Form onSubmit={handleCreateAthlete}>
          <Modal.Header closeButton>
            <Modal.Title>Create Athlete</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {error && <p className="text-danger">{error}</p>}

            <Form.Group className="mb-3" controlId="athlete-first-name">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                name="firstName"
                onChange={handleAthleteChange}
                required
                type="text"
                value={athleteForm.firstName}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="athlete-last-name">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                name="lastName"
                onChange={handleAthleteChange}
                required
                type="text"
                value={athleteForm.lastName}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="athlete-date-of-birth">
              <Form.Label>Date of Birth</Form.Label>
              <Form.Control
                name="dateOfBirth"
                onChange={handleAthleteChange}
                type="date"
                value={athleteForm.dateOfBirth}
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateAthlete(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Creating...' : 'Create Athlete'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </main>
  );
}

export default Season;
