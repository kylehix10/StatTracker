import { useEffect, useMemo, useState } from 'react';
import { Button, Table, Toast, ToastContainer } from 'react-bootstrap';
import { Link, useLocation, useParams } from 'react-router-dom';
import { createStat, getGame, getStatsByGame, getTeam, updateStat } from '../api';

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

function emptyStats() {
  return STAT_COLUMNS.reduce((stats, column) => ({ ...stats, [column.key]: '' }), {});
}

function RecordStat() {
  const { gameId } = useParams();
  const location = useLocation();
  const [game, setGame] = useState(null);
  const [athletes, setAthletes] = useState([]);
  const [statsByAthlete, setStatsByAthlete] = useState({});
  const [favoriteAthleteIds, setFavoriteAthleteIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadStatSheet() {
      try {
        setLoading(true);
        setError('');

        const gameResponse = await getGame(gameId);
        const currentGame = gameResponse.data;

        const [homeTeamResponse, awayTeamResponse, statsResponse] = await Promise.all([
          currentGame.homeTeamId ? getTeam(currentGame.homeTeamId) : Promise.resolve({ data: null }),
          currentGame.awayTeamId ? getTeam(currentGame.awayTeamId) : Promise.resolve({ data: null }),
          getStatsByGame(gameId)
        ]);

        const rosterRows = [
          ...(homeTeamResponse.data?.roster || []).map(row => ({
            ...row.athlete,
            teamName: homeTeamResponse.data.name
          })),
          ...(awayTeamResponse.data?.roster || []).map(row => ({
            ...row.athlete,
            teamName: awayTeamResponse.data.name
          }))
        ];

        const existingStats = {};
        statsResponse.data.forEach(stat => {
          existingStats[stat.athleteId] = {
            id: stat.id,
            ...STAT_COLUMNS.reduce((values, column) => ({
              ...values,
              [column.key]: stat[column.key] ?? ''
            }), {})
          };
        });

        setGame(currentGame);
        setAthletes(rosterRows);
        setStatsByAthlete(existingStats);
      } catch (err) {
        setError('Unable to load stat sheet');
      } finally {
        setLoading(false);
      }
    }

    loadStatSheet();
  }, [gameId]);

  const gameTitle = useMemo(() => {
    if (!game) return 'Record Stats';
    const homeName = game.homeTeam?.name || (!game.homeTeamId ? game.opponentName : null) || 'Home';
    const awayName = game.awayTeam?.name || (!game.awayTeamId ? game.opponentName : null) || 'Away';
    return `${homeName} vs ${awayName}`;
  }, [game]);

  const seasonTeamId = location.state?.teamId || game?.homeTeamId || game?.awayTeamId;

  const sortedAthletes = useMemo(() => {
    const favoriteIds = new Set(favoriteAthleteIds);

    return [...athletes].sort((firstAthlete, secondAthlete) => {
      const firstIsFavorite = favoriteIds.has(firstAthlete.id);
      const secondIsFavorite = favoriteIds.has(secondAthlete.id);

      if (firstIsFavorite === secondIsFavorite) {
        return 0;
      }

      return firstIsFavorite ? -1 : 1;
    });
  }, [athletes, favoriteAthleteIds]);

  const handleToggleFavorite = (athleteId) => {
    setFavoriteAthleteIds(current => (
      current.includes(athleteId)
        ? current.filter(id => id !== athleteId)
        : [...current, athleteId]
    ));
  };

  const handleStatChange = (athleteId, statKey, value) => {
    setStatsByAthlete(current => ({
      ...current,
      [athleteId]: {
        ...emptyStats(),
        ...current[athleteId],
        [statKey]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');

      const statRows = athletes
        .map(athlete => ({
          athleteId: athlete.id,
          values: statsByAthlete[athlete.id] || emptyStats()
        }))
        .filter(row => STAT_COLUMNS.some(column => row.values[column.key] !== ''));

      await Promise.all(statRows.map(row => {
        const payload = {
          athleteId: row.athleteId,
          gameId,
          ...STAT_COLUMNS.reduce((values, column) => ({
            ...values,
            [column.key]: row.values[column.key] === '' ? null : Number(row.values[column.key])
          }), {})
        };

        return row.values.id
          ? updateStat(row.values.id, payload)
          : createStat(payload);
      }));
      setShowSaveToast(true);
    } catch (err) {
      setError('Unable to save stats');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading stat sheet...</p>;

  return (
    <main className="record-stat-page">
      <div className="record-stat-header">
        <div>
          <h1>{gameTitle}</h1>
          {game?.date && <p>{new Date(game.date).toLocaleDateString()}</p>}
        </div>
        <Button onClick={handleSave} disabled={saving || athletes.length === 0}>
          {saving ? 'Saving...' : 'Save Stats'}
        </Button>
      </div>

      {error && <p className="text-danger">{error}</p>}

      {seasonTeamId && (
        <Link className="record-stat-back-link" to={`/season/${seasonTeamId}`}>
          Back to season
        </Link>
      )}

      <div className="stat-table-wrap">
        <Table striped bordered hover className="stat-table">
          <thead>
            <tr>
              <th>Athlete</th>
              <th>Favorite</th>
              {STAT_COLUMNS.map(column => (
                <th key={column.key}>{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedAthletes.map(athlete => {
              const athleteStats = statsByAthlete[athlete.id] || emptyStats();
              const isFavorite = favoriteAthleteIds.includes(athlete.id);

              return (
                <tr key={athlete.id}>
                  <th scope="row">{athlete.firstName} {athlete.lastName}</th>
                  <td>
                    <Button
                      aria-label={`${isFavorite ? 'Remove' : 'Add'} ${athlete.firstName} ${athlete.lastName} ${isFavorite ? 'from' : 'to'} favorites`}
                      className="favorite-athlete-button"
                      onClick={() => handleToggleFavorite(athlete.id)}
                      size="sm"
                      title={isFavorite ? 'Remove favorite' : 'Favorite'}
                      type="button"
                      variant="link"
                    >
                      <i
                        aria-hidden="true"
                        className={`bi ${isFavorite ? 'bi-star-fill' : 'bi-star'}`}
                      ></i>
                    </Button>
                  </td>
                  {STAT_COLUMNS.map(column => (
                    <td key={column.key}>
                      <input
                        aria-label={`${athlete.firstName} ${athlete.lastName} ${column.label}`}
                        min="0"
                        type="number"
                        value={athleteStats[column.key]}
                        onChange={event => handleStatChange(athlete.id, column.key, event.target.value)}
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>

      <ToastContainer className="dashboard-toast-container" position="top-end">
        <Toast
          autohide
          bg="success"
          delay={2500}
          onClose={() => setShowSaveToast(false)}
          show={showSaveToast}
        >
          <Toast.Header>
            <strong className="me-auto">Stats saved</strong>
          </Toast.Header>
          <Toast.Body className="text-white">
            Stat changes were saved successfully.
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </main>
  );
}

export default RecordStat;
