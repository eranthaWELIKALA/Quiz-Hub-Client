import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './WinnersPage.css';

const SERVER_URL = process.env.SERVER_URL;

const WinnersPage = () => {
    const [winners, setWinners] = useState([]);
    const [newWinner, setNewWinner] = useState(null);

    useEffect(() => {
        // Connect to the WebSocket server
        const socket = io(SERVER_URL);

        // Listen for the initial winners list
        socket.on('winners', (winnersData) => {
            setWinners(winnersData);
        });

        // Listen for new winner updates
        socket.on('new-winner', (winnerData) => {
            setNewWinner(winnerData);
            setWinners((prevWinners) => [...prevWinners, winnerData]);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <div>
            <h1>Current Winners</h1>
            {winners.length === 0 ? (
                <p>No winners yet</p> // Message if no winners exist
            ) : (
                <ul>
                    {winners.map((winner, index) => (
                        <li key={index}>
                            {winner.name}: {winner.points} points
                        </li>
                    ))}
                </ul>
            )}

            {newWinner && (
                <div className="new-winner-notification">
                    <h2>New Winner: {newWinner.name}</h2>
                    <p>{newWinner.points} points</p>
                </div>
            )}
        </div>
    );
};

export default WinnersPage;
