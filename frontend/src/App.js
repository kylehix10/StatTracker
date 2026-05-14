import './App.css';
import Navbar from './components/Navbar';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import RecordStat from './pages/RecordStat';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/record-stat/:gameId" element={<RecordStat />} />
      </Routes>
    </BrowserRouter>
    </div>
  );
}

export default App;
