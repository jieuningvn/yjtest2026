import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NewWorldSymphony from './pages/NewWorldSymphony';
import FourSeasonsSpring from './pages/FourSeasonsSpring';
import SuccessPage from './pages/SuccessPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<NewWorldSymphony />} />
          <Route path="/spring" element={<FourSeasonsSpring />} />
          <Route path="/success" element={<SuccessPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
