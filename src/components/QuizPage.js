import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import './QuizPage.css';

const socket = io(process.env.REACT_APP_SERVER_URL); // Connect to backend

function QuizPage() {
    console.log(process.env.REACT_APP_SERVER_URL);
    const { uuid } = useParams(); // Extract session ID from URL
    const navigate = useNavigate();

    const [error, setError] = useState(null);
    const [question, setQuestion] = useState(null);
    const [options, setOptions] = useState([]);
    const [showOptions, setShowOptions] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [correctAnswer, setCorrectAnswer] = useState(null);
    const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [userId, setUserId] = useState(localStorage.getItem('userId') || '');
    const storedSessionId = localStorage.getItem('sessionId');

    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        if (!uuid || storedSessionId !== uuid || !storedUserId) {
            localStorage.clear();
            localStorage.setItem('sessionId', uuid);
            navigate('/');
            return;
        }

        // Join the quiz room
        socket.emit('join-quiz', { sessionId: uuid }, (response) => {
            // The response will be handled here
            if (response.success) {
                console.log('Successfully joined the quiz!');
            } else {
                console.log('Failed to join the quiz: ' + response.message);
                setError(response.message);
            }
        });

        // Listen for the first question
        socket.on('next-question', (data) => {
            if (data) {
                setQuestion(data.question);
                setOptions(data.answers);
                setCorrectAnswer(data.correctAnswer);
                setShowOptions(false);
                setShowCorrectAnswer(false);
                setTimeLeft(data.time.questionDuration);
                setSelectedAnswer(null);

                // Show question for `questionDuration`
                setTimeout(() => {
                    setShowOptions(true);
                    setTimeLeft(data.time.answeringDuration);
                    setTimeout(() => {
                        setShowOptions(false);
                    }, data.time.answeringDuration * 1000);
                }, data.time.questionDuration * 1000);
            }
        });

        socket.on('reveal-answer', () => {
            console.log("Reveal Answer");
            setShowCorrectAnswer(true);
        });

        socket.on('quiz-ended', () => {
            setShowOptions(false);
            setQuestion(null);
            setOptions([]);
            setCorrectAnswer(null);
            setShowCorrectAnswer(false);
            setTimeLeft(0);
        });

        return () => {
            socket.off('next-question');
            socket.off('reveal-answer');
        };
    }, [uuid, storedSessionId, navigate]);

    const handleAnswerClick = (selectedIndex) => {
        if (!showOptions || showCorrectAnswer) return;
        setSelectedAnswer(selectedIndex);

        const answerData = {
            sessionId: uuid,
            userId,
            answer: selectedIndex,
        };

        // Send answer via socket
        socket.emit('submit-answer', answerData);
    };

    return (
        <div className="QuizPage">
            <h1>Live Quiz</h1>
            {question ? (
                <div className="question-container">
                    <h2>{question}</h2>

                    {(showOptions || showCorrectAnswer) && (
                        <div className="options">
                            {options.map((option, index) => (
                                <span
                                    key={index}
                                    className={`op 
                                        ${selectedAnswer === index ? "selected" : ""} 
                                        ${showCorrectAnswer && index === correctAnswer ? "correct" : ""}
                                        ${showCorrectAnswer && selectedAnswer === index && selectedAnswer !== correctAnswer ? "incorrect" : ""}`
                                    }
                                    onClick={() => handleAnswerClick(index)}
                                >
                                    {option}
                                </span>
                            ))}
                        </div>
                    )}

                    {(!showOptions && !showCorrectAnswer) && (
                        <p>Waiting...</p>
                    )}

                    {showCorrectAnswer && (
                        <p className="correct-answer">Correct Answer: {options[correctAnswer]}</p>
                    )}
                </div>
            ) : error ? (
                <p>{error}</p>
            ) : (
                <p>Waiting for the next question...</p>
            )}
        </div>
    );
}

export default QuizPage;
