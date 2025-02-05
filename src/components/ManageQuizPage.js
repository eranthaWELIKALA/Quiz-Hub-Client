import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const SOCKET_SERVER_URL = process.env.REACT_APP_SERVER_URL;

function ManageQuizPage() {
    const { quizId, sessionId } = useParams();
    const navigate = useNavigate();
    const socketRef = useRef(null);

    const [session, setSession] = useState(null);
    const [question, setQuestion] = useState(null);
    const [options, setOptions] = useState([]);
    const [correctAnswer, setCorrectAnswer] = useState(null);
    const [invalidQuiz, setInvalidQuiz] = useState(false);
    const [quizEnded, setQuizEnded] = useState(false);
    
    const [questionVisible, setQuestionVisible] = useState(false);
    const [optionsVisible, setOptionsVisible] = useState(false);
    const [answerRevealed, setAnswerRevealed] = useState(false);
    const [waiting, setWaiting] = useState(false);
    
    const [timer, setTimer] = useState(0); // Countdown timer

    const startQuiz = () => {
        if (socketRef.current) {
            socketRef.current.emit('start-quiz', { quizId }, (response) => {
                setSession(response.sessionId);
                setQuizEnded(false);
                navigate(`/manage-quiz/${quizId}/${response.sessionId}`);
            });
        }
    };

    const nextQuestion = () => {
        if (socketRef.current) {
            socketRef.current.emit('next-question', { sessionId });
        }
    };

    useEffect(() => {
        const newSocket = io(SOCKET_SERVER_URL);
        socketRef.current = newSocket;

        if (sessionId) {
            newSocket.emit('join-quiz-host', { sessionId });

            newSocket.on('next-question', (data) => {
                setQuestion(data.question);
                setOptions(data.answers);
                setCorrectAnswer(data.correctAnswer);
                setQuestionVisible(true);
                setOptionsVisible(false);
                setAnswerRevealed(false);
                setWaiting(false);

                setTimer(data.time.questionDuration); // ⏳ Set timer for question display

                // Show question for questionDuration seconds
                setTimeout(() => {
                    setQuestionVisible(true);
                    setOptionsVisible(true);
                    setTimer(data.time.answeringDuration); // ⏳ Set timer for answering duration

                    // Show options for answeringDuration seconds
                    setTimeout(() => {
                        setOptionsVisible(false);
                        setWaiting(true);
                        setTimer(5); // ⏳ Set 5-second timer before revealing answer

                        // Wait extra 5 seconds before revealing answer
                        setTimeout(() => {
                            setOptionsVisible(true);
                            setWaiting(false);
                            setAnswerRevealed(true);
                            newSocket.emit('reveal-answer', { sessionId });
                            setTimer(0); // Stop timer after revealing answer
                        }, 5000);
                    }, data.time.answeringDuration * 1000);
                }, data.time.questionDuration * 1000);
            });

            newSocket.on('invalid-quiz-id', (data) => {
                setInvalidQuiz(true);
            });

            newSocket.on('quiz-ended', (data) => {
                setQuizEnded(true);
            });
        }

        return () => {
            newSocket.disconnect();
        };
    }, [sessionId]);

    // Countdown effect
    useEffect(() => {
        if (timer > 0) {
            const countdown = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);

            return () => clearInterval(countdown); // Cleanup on unmount or timer reset
        }
    }, [timer]);

    return (
        <div>
            <h1>Manage Quiz {quizId}</h1>
            {!sessionId ? (
                <button onClick={startQuiz}>Start Quiz</button>
            ) : (
                <>
                    {!quizEnded && questionVisible && <h2>{question}</h2>}
                    {!quizEnded && timer > 0 && <h3>⏳ Time Left: {timer}s</h3>} {/* Display Timer */}
                    {!quizEnded && optionsVisible && (
                        <ul>
                            {options.map((option, index) => (
                                <li key={index}>{option}</li>
                            ))}
                        </ul>
                    )}
                    {invalidQuiz && <p>Invalid Quiz Id. Make sure you have created the quiz first...</p>}
                    {!quizEnded && waiting && <p>Waiting for correct answer to be revealed...</p>}
                    {quizEnded && <p>You reached the end of the quiz...</p>}
                    {!quizEnded && answerRevealed && <h3>✅ Correct Answer: {correctAnswer}</h3>}
                    {!quizEnded && <button onClick={nextQuestion}>Next Question</button>}
                    {quizEnded && <button onClick={() => navigate('/manage-quiz/' + quizId)}>Start Another Quiz</button>}
                    <button onClick={() => navigate('/winners')}>View Leaderboard</button>
                </>
            )}
        </div>
    );
}

export default ManageQuizPage;
