import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io(process.env.SERVER_URL); // Connect to backend

function QuizPage() {
    const { uuid } = useParams(); // Extract session ID from URL
    const navigate = useNavigate();

    const [question, setQuestion] = useState(null);
    const [options, setOptions] = useState([]);
    const [showOptions, setShowOptions] = useState(false);
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
        socket.emit('join-quiz', { sessionId: uuid });

        // Listen for the first question
        socket.on('next-question', (data) => {
            setShowOptions(false);
            setQuestion(data.question);
            setOptions(data.answers);
            setCorrectAnswer(data.correctAnswer);
            setShowOptions(false);
            setShowCorrectAnswer(false);
            setTimeLeft(data.time.questionDuration);

            // Show question for `questionDuration`
            setTimeout(() => {
                setShowOptions(true);
                setTimeLeft(data.time.answeringDuration);
                setTimeout(() => {
                    setShowOptions(false);
                }, data.time.answeringDuration * 1000);
            }, data.time.questionDuration * 1000);
        });

        socket.on('reveal-answer', () => {
            console.log("Reveal Answer");
            setShowCorrectAnswer(true);
        });

        return () => {
            socket.off('next-question');
            socket.off('reveal-answer');
        };
    }, [uuid, storedSessionId, navigate]);

    const handleAnswerClick = (selectedAnswer) => {
        const answerData = {
            sessionId: uuid,
            userId,
            answer: selectedAnswer,
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

                    {(showOptions && !showCorrectAnswer) && (
                        <div className="options-container">
                            {options.map((option, index) => (
                                <button key={index} className="option" onClick={() => handleAnswerClick(index)}>
                                    {option}
                                </button>
                            ))}
                        </div>
                    )}

                    {showCorrectAnswer && (
                        <p className="correct-answer">Correct Answer: {correctAnswer}</p>
                    )}
                </div>
            ) : (
                <p>Waiting for the next question...</p>
            )}
        </div>
    );
}

export default QuizPage;
