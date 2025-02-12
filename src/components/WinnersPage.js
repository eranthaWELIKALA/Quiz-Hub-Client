import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import './WinnersPage.css';

const REACT_APP_SERVER_URL = process.env.REACT_APP_SERVER_URL;

const imageList = [
    '/images/clown-fish.png',
    '/images/elephant.png',
    '/images/hippo.png',
    '/images/ladybug.png',
    '/images/lion.png.png',
    '/images/mouse.png',
    '/images/owl.png',
    '/images/pig.png',
    '/images/rabbit.png',
    '/images/sheep.png',
];

const getRandomImage = () => {
    const randomIndex = Math.floor(Math.random() * imageList.length);
    return imageList[randomIndex];
};

const WinnersPage = () => {
    const { uuid } = useParams(); // Extract session ID from URL
    const [winners, setWinners] = useState([]);

    useEffect(() => {
        // Connect to the WebSocket server
        const socket = io(REACT_APP_SERVER_URL);

        if (uuid) {
            socket.emit('retrieve-winners', { sessionId: uuid });
        }

        // Listen for the initial winners list
        socket.on('winners', (winnersData) => {
            setWinners((prevWinners) => {
                return winnersData.map(winner => {
                    const prevWinner = prevWinners.find(prevWinner => prevWinner.id === winner.id);
                    winner.image = prevWinner ? prevWinner.image : getRandomImage();
                    return winner;
                });
            });

        });

        // Clean up the socket connection on component unmount
        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <div className="container">
            <div className="topLeadersList">
                {winners.slice(0, 3).map((winner) => (
                    <div className="winner" key={winner.id}>
                        <div className="containerImage">
                            <img className="image" loading="lazy" src={winner.image} />
                            <div className="crown">
                                <svg
                                    id="crown1"
                                    fill="#0f74b5"
                                    data-name="Layer 1"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 100 50"
                                >
                                    <polygon
                                        className="cls-1"
                                        points="12.7 50 87.5 50 100 0 75 25 50 0 25.6 25 0 0 12.7 50"
                                    />
                                </svg>
                            </div>
                            <div className="leaderName">{winner.name}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="playerslist">
                <div className="table">
                    <div>#</div>

                    <div>Name</div>

                    <div>
                        Score
                    </div>

                </div>
                {winners.length === 0 ? (
                    <p>No winners yet</p> // Message if no winners exist
                ) : (
                    <div className="list">
                        {winners.map((winner, index) => (
                            <div className="player" key={winner.id}>
                                <span> {index + 1}</span>
                                <div className="user">
                                    <img className="image" src={winner.image} />
                                    <span> {winner.name} </span>
                                </div>
                                <span> {winner.score} </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};


export default WinnersPage;
