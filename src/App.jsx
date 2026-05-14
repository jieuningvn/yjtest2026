import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Lesson1 from './pages/Lesson1';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Lesson1 />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
