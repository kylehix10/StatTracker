import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Form, Modal, Toast, ToastContainer } from 'react-bootstrap';
import { createTeam, deleteTeam, getTeams } from '../api';

function getLoggedInUser() {
  const savedUser = localStorage.getItem('statTrackerUser');
  return savedUser ? JSON.parse(savedUser) : null;
}

function Dashboard() {
  const navigate = useNavigate();
  const [currentUser] = useState(getLoggedInUser);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [userTeams, setUserTeams] = useState([]);
  const [teamForm, setTeamForm] = useState({
    name: '',
    town: '',
    level: '',
    sportName: '',
    year: new Date().getFullYear()
  });
  const [teamToDelete, setTeamToDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const loadDashboardOptions = useCallback(async () => {
    try {
      setError('');

      const teamsResponse = await getTeams();

      setUserTeams(teamsResponse.data.filter(team => team.userId === currentUser?.id));
    } catch (err) {
      setError('Unable to load dashboard options. Make sure the backend server is running.');
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

    if (!teamForm.name || !teamForm.town || !teamForm.level || !teamForm.sportName.trim() || !teamForm.year) {
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
        level: '',
        sportName: ''
      }));
      await loadDashboardOptions();
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to create team');
    } finally {
      setSaving(false);
    }
  };

  const handleRequestDeleteTeam = (event, team) => {
    event.stopPropagation();
    setError('');
    setTeamToDelete(team);
  };

  const handleCancelDeleteTeam = () => {
    if (!deleting) {
      setTeamToDelete(null);
    }
  };

  const handleDeleteTeam = async () => {
    if (!teamToDelete) {
      return;
    }

    try {
      setDeleting(true);
      setError('');
      await deleteTeam(teamToDelete.id);
      setUserTeams(current => current.filter(team => team.id !== teamToDelete.id));
      setTeamToDelete(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to delete team');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="Dashboard">
      <section className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h1>Welcome {currentUser.firstName}</h1>
          </div>

          <div className="dashboard-actions">
            <Button aria-label="Create team" onClick={handleOpenCreateTeam}>
              <i className="bi bi-plus-circle-fill"></i>
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
                <Button
                  aria-label={`Delete ${team.name}`}
                  className="team-card-delete"
                  onClick={(event) => handleRequestDeleteTeam(event, team)}
                  onKeyDown={(event) => event.stopPropagation()}
                  size="sm"
                  type="button"
                  variant="link"
                  
                >
                  <i aria-hidden="true" className="bi bi-x-lg"></i>
                </Button>
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

      <ToastContainer className="dashboard-toast-container" position="top-end">
        <Toast show={Boolean(teamToDelete)} onClose={handleCancelDeleteTeam} bg="light">
          <Toast.Header closeButton={!deleting}>
            <strong className="me-auto">Are you sure you want to delete?</strong>
          </Toast.Header>
          <Toast.Body>
            {teamToDelete && <p className="mb-3">{teamToDelete.name}</p>}
            <div className="delete-toast-actions">
              <Button
                disabled={deleting}
                onClick={handleDeleteTeam}
                size="sm"
                variant="danger"
              >
                {deleting ? 'Deleting...' : 'Yes'}
              </Button>
              <Button
                disabled={deleting}
                onClick={handleCancelDeleteTeam}
                size="sm"
                variant="secondary"
              >
                No
              </Button>
            </div>
          </Toast.Body>
        </Toast>
      </ToastContainer>

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
              <Form.Control
                name="sportName"
                onChange={handleTeamChange}
                placeholder="Football"
                required
                type="text"
                value={teamForm.sportName}
              />
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
            <Button type="submit" disabled={saving}>
              {saving ? 'Creating...' : 'Create Team'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </main>
  );
}

export default Dashboard;
