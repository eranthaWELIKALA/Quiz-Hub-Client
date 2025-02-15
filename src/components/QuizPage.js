import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import styled from "styled-components";

const socket = io(process.env.REACT_APP_SERVER_URL);

// Styled Components
const QuizContainer = styled.div`
    font-family: Amatic SC, sans-serif;
    text-align: center;
`;

const QuestionContainer = styled.div`
    font-family: "Lato", sans-serif;
    margin-top: 20px;
`;

const OptionsContainer = styled.div`
    width: 350px;
    margin: 0 auto;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
`;

const Option = styled.span`
    width: 45%;
    min-height: 3rem;
    margin-top: 20px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    line-height: 1.5em;
    text-align: center;
    background: #d90;
    border-radius: 20px;
    color: var(--primary-text-color);
    transition: 0.2s;
    cursor: pointer;

    &.selected {
        background: #ffcc00;
    }

    &.correct {
        background: #28a745;
        color: white;
    }

    &.incorrect {
        background: #dc3545;
        color: white;
    }
`;

const CorrectAnswerText = styled.p`
    font-weight: bold;
    margin-top: 10px;
`;

function QuizPage() {
    const { uuid } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [question, setQuestion] = useState(null);
    const [options, setOptions] = useState([]);
    const [showOptions, setShowOptions] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [correctAnswer, setCorrectAnswer] = useState(null);
    const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
    const storedSessionId = localStorage.getItem("sessionId");

    useEffect(() => {
        if (!uuid || storedSessionId !== uuid) {
            localStorage.clear();
            localStorage.setItem("sessionId", uuid);
            navigate("/");
            return;
        }

        socket.emit("join-quiz", { sessionId: uuid }, (response) => {
            if (!response.success) {
                setError(response.message);
            }
        });

        socket.on("next-question", (data) => {
            if (data) {
                setQuestion(data.question);
                setOptions(data.answers);
                setCorrectAnswer(data.correctAnswer);
                setShowOptions(false);
                setShowCorrectAnswer(false);
                setSelectedAnswer(null);

                setTimeout(() => {
                    setShowOptions(true);
                    setTimeout(
                        () => setShowOptions(false),
                        data.time.answeringDuration * 1000
                    );
                }, data.time.questionDuration * 1000);
            }
        });

        socket.on("reveal-answer", () => setShowCorrectAnswer(true));

        return () => {
            socket.off("next-question");
            socket.off("reveal-answer");
        };
    }, [uuid, storedSessionId, navigate]);

    const handleAnswerClick = (index) => {
        if (!showOptions || showCorrectAnswer) return;
        setSelectedAnswer(index);
        socket.emit("submit-answer", {
            sessionId: uuid,
            userId: localStorage.getItem("userId"),
            answer: index,
        });
    };

    return (
        <QuizContainer>
            <h1>Live Quiz</h1>
            {question ? (
                <QuestionContainer>
                    <h2>{question}</h2>

                    {(showOptions || showCorrectAnswer) && (
                        <OptionsContainer>
                            {options.map((option, index) => (
                                <Option
                                    key={index}
                                    className={`${
                                        selectedAnswer === index
                                            ? "selected"
                                            : ""
                                    } 
                                                 ${
                                                     showCorrectAnswer &&
                                                     index === correctAnswer
                                                         ? "correct"
                                                         : ""
                                                 }
                                                 ${
                                                     showCorrectAnswer &&
                                                     selectedAnswer === index &&
                                                     selectedAnswer !==
                                                         correctAnswer
                                                         ? "incorrect"
                                                         : ""
                                                 }`}
                                    onClick={() => handleAnswerClick(index)}
                                >
                                    {option}
                                </Option>
                            ))}
                        </OptionsContainer>
                    )}

                    {showCorrectAnswer && (
                        <CorrectAnswerText>
                            ✅ Correct Answer: {options[correctAnswer]}
                        </CorrectAnswerText>
                    )}
                </QuestionContainer>
            ) : error ? (
                <p>{error}</p>
            ) : (
                <p>Waiting for the next question...</p>
            )}
        </QuizContainer>
    );
}

export default QuizPage;
