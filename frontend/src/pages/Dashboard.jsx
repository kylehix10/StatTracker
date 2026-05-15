import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Form, Modal } from 'react-bootstrap';
import { createTeam, getSports, getTeams } from '../api';

function getLoggedInUser() {
  const savedUser = localStorage.getItem('statTrackerUser');
  return savedUser ? JSON.parse(savedUser) : null;
}

function Dashboard() {
  const navigate = useNavigate();
  const [currentUser] = useState(getLoggedInUser);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [userTeams, setUserTeams] = useState([]);
  const [sports, setSports] = useState([]);
  const [teamForm, setTeamForm] = useState({
    name: '',
    town: '',
    level: '',
    sportId: '',
    year: new Date().getFullYear()
  });
  const [saving, setSaving] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [error, setError] = useState('');

  const loadDashboardOptions = useCallback(async () => {
    try {
      setLoadingOptions(true);
      setError('');

      const [teamsResponse, sportsResponse] = await Promise.all([
        getTeams(),
        getSports()
      ]);

      setUserTeams(teamsResponse.data.filter(team => team.userId === currentUser?.id));
      setSports(sportsResponse.data);
      setTeamForm(current => ({
        ...current,
        sportId: current.sportId || sportsResponse.data[0]?.id || ''
      }));
    } catch (err) {
      setError('Unable to load dashboard options. Make sure the backend server is running.');
    } finally {
      setLoadingOptions(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadDashboardOptions();
  }, [loadDashboardOptions]);

  const handleOpenCreateTeam = () => {
    setShowCreateTeam(true);
    loadDashboardOptions();
  };

  const handleTeamChange = (event) => {
    const { name, value } = event.target;
    setTeamForm(current => ({ ...current, [name]: value }));
  };

  const handleCreateTeam = async (event) => {
    event.preventDefault();

    if (!currentUser?.id) {
      setError('Log in before creating a team');
      return;
    }

    if (!teamForm.name || !teamForm.town || !teamForm.level || !teamForm.sportId || !teamForm.year) {
      setError('Name, town, level, sport, and year are required');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await createTeam({
        ...teamForm,
        year: Number(teamForm.year),
        userId: currentUser.id
      });
      setShowCreateTeam(false);
      setTeamForm(current => ({
        ...current,
        name: '',
        town: '',
        level: ''
      }));
      await loadDashboardOptions();
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to create team');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="Dashboard">
      <section className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            {currentUser && <p>{currentUser.firstName} {currentUser.lastName}</p>}
          </div>

          <div className="dashboard-actions">
            <Button aria-label="Create team" onClick={handleOpenCreateTeam}>
              <i className="bi-plus-circle-fill"></i>
              <span>Create Team</span>
            </Button>
          </div>
        </div>

        {userTeams.length === 0 ? (
          <p className="no-teams-message">You have no team. Create a team to continue.</p>
        ) : (
          <div className="team-card-grid">
            {userTeams.map(team => (
              <Card
                key={team.id}
                className="team-card"
                onClick={() => navigate(`/season/${team.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    navigate(`/season/${team.id}`);
                  }
                }}
              >
                <Card.Body>
                  <Card.Title>{team.name}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {team.town} {team.level}
                  </Card.Subtitle>
                  <Card.Text>
                    {team.sport?.name || 'Sport'} - {team.year}
                  </Card.Text>
                  <Card.Text>
                    {team.roster?.length || 0} athletes
                  </Card.Text>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Modal show={showCreateTeam} onHide={() => setShowCreateTeam(false)} centered>
        <Form onSubmit={handleCreateTeam}>
          <Modal.Header closeButton>
            <Modal.Title>Create Team</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {error && <p className="text-danger">{error}</p>}

            <Form.Group className="mb-3" controlId="team-name">
              <Form.Label>Team Name</Form.Label>
              <Form.Control
                name="name"
                onChange={handleTeamChange}
                required
                type="text"
                value={teamForm.name}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="team-town">
              <Form.Label>Town</Form.Label>
              <Form.Control
                name="town"
                onChange={handleTeamChange}
                required
                type="text"
                value={teamForm.town}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="team-level">
              <Form.Label>Level</Form.Label>
              <Form.Control
                name="level"
                onChange={handleTeamChange}
                placeholder="Varsity"
                required
                type="text"
                value={teamForm.level}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="team-sport">
              <Form.Label>Sport</Form.Label>
              <Form.Select name="sportId" value={teamForm.sportId} onChange={handleTeamChange} disabled={loadingOptions} required>
                <option value="">{loadingOptions ? 'Loading sports...' : 'Select a sport'}</option>
                {sports.map(sport => (
                  <option key={sport.id} value={sport.id}>{sport.name}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="team-year">
              <Form.Label>Year</Form.Label>
              <Form.Control
                min="1900"
                name="year"
                onChange={handleTeamChange}
                required
                type="number"
                value={teamForm.year}
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateTeam(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || loadingOptions}>
              {saving ? 'Creating...' : 'Create Team'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </main>
  );
}

export default Dashboard;
