import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Splash() {
  return (
    <main className="splash-page">
      <img
        alt=""
        aria-hidden="true"
        className="splash-background-image"
        src={`${process.env.PUBLIC_URL}/palmettoTree2.png`}
      />

      <header className="splash-topbar">
        <h1>StatTracker</h1>
        <Button as={Link} to="/login" variant="light">
          Login
        </Button>
      </header>

      <section className="splash-hero">
        <div className="splash-hero-content">
          <p className="splash-kicker">Team performance, clearly tracked</p>
          <h2>Build your season, record every game, and keep the stats that matter close.</h2>
          <p>
            Manage rosters, schedule matchups, and turn each stat sheet into a season-long view
            of every athlete's progress.
          </p>
          <Button as={Link} to="/login" size="lg">
            Get Started
          </Button>
        </div>

        <div className="splash-scoreboard" aria-hidden="true">
          <div className="splash-scoreboard-header">
            <span>Season Leaders</span>
            <span>Varsity</span>
          </div>
          <div className="splash-stat-row">
            <span>Passing Yards</span>
            <strong>1,842</strong>
          </div>
          <div className="splash-stat-row">
            <span>Rushing TDs</span>
            <strong>18</strong>
          </div>
          <div className="splash-stat-row">
            <span>Tackles</span>
            <strong>74</strong>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Splash;
