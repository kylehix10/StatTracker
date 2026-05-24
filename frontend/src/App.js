import './App.css';
import Navbar from './components/Navbar';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import RecordStat from './pages/RecordStat';
import Season from './pages/Season';
import Splash from './pages/Splash';

function AppRoutes() {
  const location = useLocation();
  const showNavbar = !['/', '/login'].includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/season/:teamId" element={<Season />} />
        <Route path="/record-stat/:gameId" element={<RecordStat />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </div>
  );
}

export default App;
