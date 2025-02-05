import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const REACT_APP_SERVER_URL = process.env.REACT_APP_SERVER_URL;

function FormPage() {
    const { uuid } = useParams();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [sessionId, setSessionId] = useState(uuid || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        const storeSessionId = localStorage.getItem('sessionId');
        const storedUserId = localStorage.getItem('userId');

        if (storeSessionId && storedUserId) {
            navigate(`/quiz/${storeSessionId}`);
        }
    }, [navigate]);

    const handleJoinQuiz = async () => {
        if (!sessionId.trim() || !name.trim()) {
            setError('Both Session Id and Name are required.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Send both UUID and Name to join the quiz
            const response = await axios.post(`${REACT_APP_SERVER_URL}/join-quiz`, {
                name,
                sessionId,
            });

            const { userId } = response.data;

            // Store session details in localStorage
            localStorage.setItem('sessionId', sessionId);
            localStorage.setItem('userId', userId);

            // Navigate to the quiz page
            navigate(`/quiz/${sessionId}`);
        } catch (err) {
            setError(err.response?.data?.error || 'Error joining quiz.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="FormPage">
            <h1>Join the Quiz</h1>
            {!sessionId && <p>Please provide a quiz UUID.</p>}
            <div className="form-container">
                {!sessionId ? (
                    <div className="form-group">
                        <label htmlFor="sessionId">Enter Quiz UUID</label>
                        <input
                            type="text"
                            id="sessionId"
                            value={sessionId}
                            onChange={(e) => setSessionId(e.target.value)}
                            placeholder="Your quiz UUID"
                            required
                        />
                    </div>
                ) : (
                    <div className="form-group">
                        <label htmlFor="name">Name</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                            required
                        />
                    </div>
                )}

                {error && <p className="error">{error}</p>}

                <button onClick={handleJoinQuiz} disabled={loading}>
                    {loading ? 'Joining...' : 'Join Quiz'}
                </button>
            </div>
        </div>
    );
}

export default FormPage;
