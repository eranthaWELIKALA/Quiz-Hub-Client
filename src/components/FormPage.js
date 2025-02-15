import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import styled, { keyframes } from "styled-components";

const REACT_APP_SERVER_URL = process.env.REACT_APP_SERVER_URL;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const FormWrapper = styled.div`
    font-family: Arial, sans-serif;
    text-align: center;
    margin-top: 50px;
    padding: 20px;
`;

const Heading = styled.h1`
    font-size: 2rem;
    color: #333;
    margin-bottom: 15px;
`;

const Paragraph = styled.p`
    font-size: 1.1rem;
    color: #555;
`;

const FormContainer = styled.div`
    max-width: 500px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease-in-out;

    &:hover {
        transform: scale(1.02);
    }
`;

const FormGroup = styled.div`
    margin-bottom: 20px;
    text-align: left;
`;

const Label = styled.label`
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    color: #333;
`;

const Input = styled.input`
    width: 100%;
    padding: 0.5rem;
    font-size: 1rem;
    border-radius: 5px;
    border: 1px solid #ddd;
    box-sizing: border-box;
    transition: border-color 0.3s ease-in-out;

    &:focus {
        outline: none;
        border-color: var(--primary-hover);
        box-shadow: 0 0 5px rgba(76, 175, 80, 0.3);
    }

    &:disabled {
        background-color: var(--disabled-color);
        cursor: not-allowed;
    }
`;

const Button = styled.button`
    width: 100%;
    padding: 12px;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease-in-out;

    &:disabled {
        background-color: #ddd;
        cursor: not-allowed;
    }

    &:not(:disabled):hover {
        background-color: var(--primary-hover);
        transform: scale(1.05);
    }

    &:focus {
        outline: none;
        box-shadow: 0 0 5px var(--primary-hover);
    }
`;

const ErrorText = styled.p`
    color: red;
    margin-top: 10px;
    font-size: 1rem;
    font-weight: bold;
    text-align: center;
    animation: ${fadeIn} 0.3s ease-in-out;
`;

function FormPage() {
    const { uuid } = useParams();
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [sessionId, setSessionId] = useState(uuid || "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (uuid) {
            const storedSessionId = localStorage.getItem("sessionId");
            const storedUserId = localStorage.getItem("userId");

            if (uuid !== storedSessionId) {
                localStorage.clear();
                localStorage.setItem("sessionId", uuid);
            }

            if (storedSessionId && storedUserId) {
                navigate(`/quiz/${storedSessionId}`);
            }
        }
    }, [uuid, navigate]);

    const handleJoinQuiz = async () => {
        if (!sessionId.trim() || !name.trim()) {
            setError("Both Session Id/Code and Name are required.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(
                `${REACT_APP_SERVER_URL}/join-quiz`,
                { name, sessionId }
            );

            const { userId } = response.data;
            localStorage.setItem("sessionId", response.data.sessionId || sessionId);
            localStorage.setItem("userId", userId);
            navigate(`/quiz/${response.data.sessionId || sessionId}`);
        } catch (err) {
            setError(err.response?.data?.error || "Error joining quiz.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <FormWrapper>
            <Heading>Join the Quiz</Heading>
            {!uuid && (
                <Paragraph>Please provide a quiz UUID or Code.</Paragraph>
            )}
            <FormContainer>
                {!uuid ? (
                    <FormGroup>
                        <Input
                            type="text"
                            id="sessionId"
                            value={sessionId}
                            onChange={(e) => setSessionId(e.target.value)}
                            placeholder="Your quiz UUID or Code"
                            required
                        />
                    </FormGroup>
                ) : (
                    <FormGroup>
                        <Label htmlFor="name">Name</Label>
                        <Input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                            required
                        />
                    </FormGroup>
                )}

                {error && <ErrorText>{error}</ErrorText>}

                <Button onClick={handleJoinQuiz} disabled={loading}>
                    {loading ? "Joining..." : "Join Quiz"}
                </Button>
            </FormContainer>
        </FormWrapper>
    );
}

export default FormPage;
