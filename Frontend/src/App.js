// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage'; // Import HomePage component
import CreateTable from './components/CreateTable';
import JoinTable from './components/JoinTable';
import Table from './components/Table';
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreateTable/>} />
        <Route path="/join" element={<JoinTable/>} />
        <Route path="/table/:tableid" element={<Table/>} />
        {/* Define other routes if needed */}
      </Routes>
    </Router>
  );
};

export default App;
