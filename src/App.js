import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import FormPage from './components/FormPage';
import WinnersPage from './components/WinnersPage';
import QuizPage from './components/QuizPage';
import ManageQuizPage from './components/ManageQuizPage';
import NotFoundPage from './components/NotFound';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<FormPage />} />
                <Route path="/:uuid" element={<FormPage />} />

                <Route path="/winners" element={<NotFoundPage />} />
                <Route path="/winners/:uuid" element={<WinnersPage />} />

                <Route path="/quiz" element={<NotFoundPage />} />
                <Route path="/quiz/:uuid" element={<QuizPage />} />

                <Route path="/manage-quiz" element={<NotFoundPage />} />
                <Route path="/manage-quiz/:quizId" element={<ManageQuizPage />} />
                <Route path="/manage-quiz/:quizId/:sessionId" element={<ManageQuizPage />} />

                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Router>
    );
}

export default App;
