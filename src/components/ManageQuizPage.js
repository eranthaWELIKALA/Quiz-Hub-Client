import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import io from "socket.io-client";
import styled from "styled-components";

const SOCKET_SERVER_URL = process.env.REACT_APP_SERVER_URL;

const Container = styled.div`
    font-family: "Lato", sans-serif;
    text-align: center;
    background-color: var(--bg-color);
    padding: 20px;
    border-radius: var(--border-radius);
    color: var(--secondary-text-color-color);
`;

const ButtonContainer = styled.div`
    display: flex;
    flex-direction: row;
    margin-top: 1rem;
    margin-bottom: 1rem;
    justify-content: center;
    align-items: center;
`;

const Button = styled.button`
    background: var(--primary-color);
    color: var(--primary-text-color);
    padding: 10px 20px;
    border: none;
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: 0.3s;
    font-size: 16px;
    margin-left: 0.5rem;
    min-width: 250px;

    &:hover {
        background: var(--primary-hover);
    }

    &:disabled {
        background: var(--disabled-color);
        cursor: not-allowed;
    }
`;

const OptionsList = styled.ul`
    list-style: none;
    padding: 0;
`;

const Option = styled.li`
    width: 100%;
    max-width: 500px;
    min-width: 250px;
    margin-left: 10px;
    margin-top: 20px;
    display: inline-block;
    line-height: 3em;
    text-align: center;
    background: var(--option-bg-color);
    border-radius: var(--border-radius);
    color: var(--primary-text-color);
    transition: 0.2s;
    cursor: pointer;

    &:hover {
        background: var(--option-bg-hover-color);
    }

    &.correct {
        background: var(--correct-answer-bg-color);
        color: white;
    }

    &.correct:hover {
        background: var(--correct-answer-bg-hover-color);
    }
`;

function ManageQuizPage() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const sessionCode = queryParams.get("code");

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
    const [timer, setTimer] = useState(0);

    const sessionURL = `${window.location.origin}/${sessionCode || sessionId}`;

    const startQuiz = () => {
        if (socketRef.current) {
            socketRef.current.emit("start-quiz", { quizId }, (response) => {
                setSession(response.sessionId);
                setQuizEnded(false);
                navigate(
                    `/manage-quiz/${quizId}/${response.sessionId}?code=${response.code}`
                );
            });
        }
    };

    const nextQuestion = () => {
        if (socketRef.current) {
            socketRef.current.emit("next-question", { sessionId });
        }
    };

    useEffect(() => {
        const newSocket = io(SOCKET_SERVER_URL);
        socketRef.current = newSocket;

        if (sessionId) {
            newSocket.emit("join-quiz-host", { sessionId });

            newSocket.on("next-question", (data) => {
                setQuestion(data.question);
                setOptions(data.answers);
                setCorrectAnswer(data.correctAnswer);
                setQuestionVisible(true);
                setOptionsVisible(false);
                setAnswerRevealed(false);
                setWaiting(false);
                setTimer(data.time.questionDuration);

                setTimeout(() => {
                    setOptionsVisible(true);
                    setTimer(data.time.answeringDuration);
                    setTimeout(() => {
                        setOptionsVisible(false);
                        setWaiting(true);
                        setTimer(5);
                        setTimeout(() => {
                            setOptionsVisible(true);
                            setWaiting(false);
                            setAnswerRevealed(true);
                            newSocket.emit("reveal-answer", { sessionId });
                            setTimer(0);
                        }, 5000);
                    }, data.time.answeringDuration * 1000);
                }, data.time.questionDuration * 1000);
            });

            newSocket.on("invalid-quiz-id", () => setInvalidQuiz(true));
            newSocket.on("quiz-ended", () => setQuizEnded(true));

            return () => {
                newSocket.disconnect();
            };
        }
    }, [sessionId]);

    useEffect(() => {
        if (timer > 0) {
            const countdown = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);

            return () => clearInterval(countdown);
        }
    }, [timer]);

    const copyToClipboard = () => {
        navigator.clipboard
            .writeText(sessionURL)
            .then(() => {
                alert("Session link copied to clipboard!");
            })
            .catch((err) => {
                console.error("Failed to copy:", err);
            });
    };

    return (
        <Container>
            <h1>Manage Quiz</h1>
            {(sessionCode || sessionId) && (
                <ButtonContainer>
                    <Button
                        onClick={copyToClipboard}
                        style={{ marginLeft: "10px", cursor: "pointer" }}
                    >
                        Copy URL
                    </Button>
                </ButtonContainer>
            )}
            {!sessionId ? (
                <Button onClick={startQuiz}>Start Quiz</Button>
            ) : (
                <>
                    {!quizEnded && questionVisible && <h2>{question}</h2>}
                    {!quizEnded && timer > 0 && <h3>⏳ Time Left: {timer}s</h3>}
                    {!quizEnded && optionsVisible && (
                        <OptionsList>
                            {options.map((option, index) => (
                                <Option
                                    className={
                                        answerRevealed &&
                                        index === correctAnswer
                                            ? "correct"
                                            : ""
                                    }
                                    key={index}
                                >
                                    {option}
                                </Option>
                            ))}
                        </OptionsList>
                    )}
                    {invalidQuiz && (
                        <p>
                            Invalid Quiz Id. Make sure you have created the quiz
                            first...
                        </p>
                    )}
                    {!quizEnded && waiting && (
                        <p>Waiting for correct answer to be revealed...</p>
                    )}
                    {quizEnded && <p>You reached the end of the quiz...</p>}
                    {!quizEnded && answerRevealed && (
                        <h3>✅ Correct Answer: {options[correctAnswer]}</h3>
                    )}
                    <ButtonContainer>
                    {!quizEnded && (
                        <Button onClick={nextQuestion} disabled={waiting}>
                            Next Question
                        </Button>
                    )}
                    {quizEnded && (
                        <Button
                            onClick={() => navigate(`/manage-quiz/${quizId}`)}
                        >
                            Start Another Quiz
                        </Button>
                    )}
                    {sessionId && (
                        <Button
                            onClick={() => navigate(`/winners/${sessionId}`)}
                        >
                            View Leaderboard
                        </Button>
                    )}
                    </ButtonContainer>
                </>
            )}
        </Container>
    );
}

export default ManageQuizPage;
