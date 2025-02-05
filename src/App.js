import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import FormPage from './components/FormPage';
import WinnersPage from './components/WinnersPage';
import QuizPage from './components/QuizPage';
import ManageQuizPage from './components/ManageQuizPage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<FormPage />} />
                <Route path="/:uuid" element={<FormPage />} />
                <Route path="/winners" element={<WinnersPage />} />
                <Route path="/quiz/:uuid" element={<QuizPage />} />
                <Route path="/manage-quiz/:quizId" element={<ManageQuizPage />} />
                <Route path="/manage-quiz/:quizId/:sessionId" element={<ManageQuizPage />} />
            </Routes>
        </Router>
    );
}

export default App;
