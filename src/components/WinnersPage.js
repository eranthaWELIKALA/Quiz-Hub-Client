import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import styled from "styled-components";

const REACT_APP_SERVER_URL = process.env.REACT_APP_SERVER_URL;

const imageList = [
    "/images/clown-fish.png",
    "/images/elephant.png",
    "/images/hippo.png",
    "/images/ladybug.png",
    "/images/lion.png",
    "/images/mouse.png",
    "/images/owl.png",
    "/images/pig.png",
    "/images/rabbit.png",
    "/images/sheep.png",
];

const getRandomImage = () => {
    const randomIndex = Math.floor(Math.random() * imageList.length);
    return imageList[randomIndex];
};

const WinnersPage = () => {
    const { uuid } = useParams();
    const [winners, setWinners] = useState([]);

    useEffect(() => {
        const socket = io(REACT_APP_SERVER_URL);

        if (uuid) {
            socket.emit("retrieve-winners", { sessionId: uuid });
        }

        socket.on("winners", (winnersData) => {
            setWinners((prevWinners) =>
                winnersData.map((winner) => {
                    const prevWinner = prevWinners.find(
                        (prevWinner) => prevWinner.id === winner.id
                    );
                    winner.image = prevWinner
                        ? prevWinner.image
                        : getRandomImage();
                    return winner;
                })
            );
        });

        return () => {
            socket.disconnect();
        };
    }, [uuid]);

    return (
        <Container>
            <TopLeadersList>
                {winners.slice(0, 3).map((winner, index) => (
                    <Winner key={winner.id} index={index}>
                        <ContainerImage>
                            <WinnerImage
                                src={winner.image}
                                alt={winner.name}
                                loading="lazy"
                            />
                            <Crown index={index} />
                            <LeaderName>{winner.name}</LeaderName>
                        </ContainerImage>
                    </Winner>
                ))}
            </TopLeadersList>

            <PlayersList>
                <Table>
                    <div>#</div>
                    <div>Name</div>
                    <div>Score</div>
                </Table>

                {winners.length === 0 ? (
                    <NoWinners>No winners yet</NoWinners>
                ) : (
                    <List>
                        {winners.map((winner, index) => (
                            <Player key={winner.id} index={index}>
                                <span>{index + 1}</span>
                                <User>
                                    <WinnerImageSmall
                                        src={winner.image}
                                        alt={winner.name}
                                    />
                                    <span>{winner.name}</span>
                                </User>
                                <span>{winner.score}</span>
                            </Player>
                        ))}
                    </List>
                )}
            </PlayersList>
        </Container>
    );
};

// 🎨 Styled Components
const Container = styled.div`
    font-family: Amatic SC, sans-serif;
    max-width: 445px;
    height: 600px;
    background-color: black;
    margin: auto;
    margin-top: 5%;
    margin-bottom: 5%;
    padding: 1rem;
    border-radius: 5px;
    box-shadow: 7px 9px 7px #00000052;
`;

const TopLeadersList = styled.div`
    display: flex;
    position: relative;
    min-height: 120px;
    padding-top: 3rem;
`;

const Winner = styled.div`
    color: black;
    position: absolute;
    left: ${({ index }) => (index === 1 ? "15%" : index === 2 ? "85%" : "50%")};
    transform: translateX(
        ${({ index }) => (index === 1 ? "-15%" : index === 2 ? "-85%" : "-50%")}
    );
    bottom: ${({ index }) => (index === 0 ? "0" : "-20%")};
`;

const ContainerImage = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const WinnerImage = styled.img`
    width: ${({ index }) => (index === 0 ? "130px" : "110px")};
    height: ${({ index }) => (index === 0 ? "130px" : "110px")};
    object-fit: cover;
    border-radius: 50%;
    border: 3px solid #b159ffcc;
`;

const WinnerImageSmall = styled.img`
    width: 28px;
    height: 28px;
    border: 1.5px solid white;
`;

const Crown = styled.div`
    position: absolute;
    top: ${({ index }) => (index === 0 ? "-20%" : "-25%")};
    left: 50%;
    transform: translateX(-50%);

    &::after {
        content: "${({ index }) => index + 1}";
        width: 30px;
        height: 30px;
        background: ${({ index }) =>
            index === 0 ? "#ffc500" : index === 1 ? "#d4d4d4" : "#ab6528"};
        border-radius: 50%;
        position: absolute;
        right: 0;
        text-align: center;
        line-height: 30px;
        font-weight: 700;
        box-shadow: 1px 1px 4px black;
    }
`;

const LeaderName = styled.div`
    position: absolute;
    text-align: center;
    color: white;
    left: 50%;
    transform: translateX(-50%);
    font-size: 22px;
`;

const PlayersList = styled.div`
    margin-top: 6rem;
    font-size: 16px;
    overflow: hidden;
    color: white;
    font-family: "Roboto Condensed", sans-serif;
`;

const Table = styled.div`
    display: grid;
    font-size: 14px;
    grid-template-columns: 0.4fr 6fr 3.6fr;
    text-align: center;

    div:nth-child(2) {
        text-align: left;
        margin-left: 5px;
    }
`;

const List = styled.div`
    overflow-y: scroll;
    height: 20rem;
    overflow-x: hidden;
`;

const Player = styled.div`
    background-color: ${({ index }) =>
        index % 2 === 0 ? "#b159ffcc" : "#330b7775"};
    display: grid;
    grid-template-columns: 0.4fr 6fr 3.6fr;
    align-items: center;
    min-height: 42px;
    text-align: center;
    padding-right: 0.4rem;
`;

const User = styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
`;

const NoWinners = styled.p`
    text-align: center;
    color: white;
`;

export default WinnersPage;
