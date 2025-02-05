import React, { useState } from 'react';
import axios from 'axios';
import './FormPage.css';
import { useNavigate } from 'react-router-dom';

const REACT_APP_SERVER_URL = process.env.REACT_APP_SERVER_URL;

function FormPage() {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [answer, setAnswer] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleEmailChange = (e) => setEmail(e.target.value);
    const handleNameChange = (e) => setName(e.target.value);
    const handleAnswerChange = (e) => setAnswer(e.target.value);

    const handleSubmit = async () => {
        if (submitted) {
            return;
        }

        try {
            // Ensure the email is from atlinkcom.com
            if (!email.endsWith('@atlinkcom.com')) {
                setError('Please use an email with @atlinkcom.com domain.');
                return;
            }

            // You can replace the URL with your actual backend endpoint
            await axios.post(REACT_APP_SERVER_URL, { email, name, answer });

            setSubmitted(true);
            navigate('/winners');
        } catch (err) {
            setError(err.response.data.error || err.message || JSON.stringify(err));
        }
    };

    return (
        <div className="FormPage">
            <h1>Inside AtLink’s CI/CD Pipeline​</h1>
            <p>Please provide the following details:</p>

            <div className="form-container">
                <div className="form-group">
                    <label htmlFor="email">Email (must be @atlinkcom.com)</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={handleEmailChange}
                        placeholder="Your email"
                        disabled={submitted}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={handleNameChange}
                        placeholder="Your name"
                        disabled={submitted}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="answer">Custom Question: What is your favorite programming language?</label>
                    <input
                        type="text"
                        id="answer"
                        value={answer}
                        onChange={handleAnswerChange}
                        placeholder="Your answer"
                        disabled={submitted}
                        required
                    />
                </div>

                {error && <p className="error">{error}</p>}

                <button onClick={handleSubmit} disabled={submitted || !email || !name || !answer}>
                    {submitted ? 'Already Submitted' : 'Submit'}
                </button>
            </div>
        </div>
    );
}

export default FormPage;
