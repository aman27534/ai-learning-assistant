import * as React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';

import Dashboard from './pages/Dashboard';

function App() {
    return (
        // @ts-ignore - Future flags are valid in v6.x but TS might complain depending on version
        <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
        </Router>
    );
}

export default App;
