import { useEffect, useMemo, useState } from 'react';
import { Button, Table } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
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
  const [game, setGame] = useState(null);
  const [athletes, setAthletes] = useState([]);
  const [statsByAthlete, setStatsByAthlete] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadStatSheet() {
      try {
        setLoading(true);
        setError('');

        const gameResponse = await getGame(gameId);
        const currentGame = gameResponse.data;

        const [homeTeamResponse, awayTeamResponse, statsResponse] = await Promise.all([
          getTeam(currentGame.homeTeamId),
          getTeam(currentGame.awayTeamId),
          getStatsByGame(gameId)
        ]);

        const rosterRows = [
          ...homeTeamResponse.data.roster.map(row => ({
            ...row.athlete,
            teamName: homeTeamResponse.data.name
          })),
          ...awayTeamResponse.data.roster.map(row => ({
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
    return `${game.homeTeam?.name || 'Home'} vs ${game.awayTeam?.name || 'Away'}`;
  }, [game]);

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

      <div className="stat-table-wrap">
        <Table striped bordered hover responsive className="stat-table">
          <thead>
            <tr>
              <th>Athlete</th>
              <th>Team</th>
              {STAT_COLUMNS.map(column => (
                <th key={column.key}>{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {athletes.map(athlete => {
              const athleteStats = statsByAthlete[athlete.id] || emptyStats();
              return (
                <tr key={athlete.id}>
                  <th scope="row">{athlete.firstName} {athlete.lastName}</th>
                  <td>{athlete.teamName}</td>
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
    </main>
  );
}

export default RecordStat;
