import { useEffect, useState } from 'react';
import styled from 'styled-components';
import io from 'socket.io-client';
import { useParams, useNavigate } from 'react-router-dom';
import { useStateContext } from '../contexts/ContextProvider';

const Container = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
`;

const Board = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const Row = styled.div`
    display: flex;
`;

const Cell = styled.button`
    height: 200px;
    width: 200px;
    font-size: 5em;
    margin: 5px;
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: ${(props) => (props.value === 'X' ? 'blue' : props.value === 'O' ? 'red' : '#575757')};
    color: white;
    border: 2px solid #000;
`;

const PlayerInfo = styled.div`
    margin-left: 20px;
    text-align: center;
`;

const PlayerName = styled.div`
    font-size: 3.5em;
    margin-bottom: 10px;
    color: ${(props) => (props.isWinner ? 'green' : 'grey')};
`;

const WaitingContainer = styled.div`
    display: flex;
    align-items: center;
    flex-direction: column;
    padding-bottom: 160px;
`;

const UrlContainer = styled.div`
    align-items: center;
    margin-top: 20px;
`;

const UrlBox = styled.input`
    padding: 10px;
    border: 2px solid #000;
    border-radius: 5px;
    width: 300px;
    margin-right: 10px;
`;

const CopyButton = styled.button`
    padding: 10px 20px;
    background-color: #24221e;
    color: #9d9d9d;
    border-radius: 5px;
    cursor: pointer;
`;


const socket = io('https://litactoe-frontend-fe028f89ec3b.herokuapp.com/');
//http://localhost:3000
//https://litactoe-frontend-fe028f89ec3b.herokuapp.com/

const TicTacToeGame = () => {
    const { lobbyId } = useParams();
    const { user, token } = useStateContext();
    const navigate = useNavigate();

    const [board, setBoard] = useState(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState(true);
    const [winner, setWinner] = useState(null);
    const [players, setPlayers] = useState([]);
    const [mySymbol, setMySymbol] = useState('');
    const [loading, setLoading] = useState(true);
    const [waitingForOpponent, setWaitingForOpponent] = useState(true);
    const [isDraw, setIsDraw] = useState(false);

    useEffect(() => {
        if (!token) {
            alert('You must Log in to play');
            navigate('/login');
            return;
        }

        const intervalId = setInterval(() => {
            if (user && user.name) {
                socket.emit('join-lobby', { lobbyId, user: { ...user, token } });
                setLoading(false);
                clearInterval(intervalId);
            }
        }, 100);

        socket.on('lobby-joined', ({ success, message, lobby, user }) => {
            if (success) {
                setBoard(lobby.board);
                setIsXNext(lobby.isXNext);
                setWinner(lobby.winner);
                setPlayers(lobby.users);
                setIsDraw(lobby.isDraw);
                setWaitingForOpponent(lobby.users.length < 2);
                if (lobby.users.length === 2) {
                    const [user1, user2] = lobby.users;
                    setMySymbol(user1.token === token ? user1.symbol : user2.symbol);
                }
            } else {
                alert(message);
                navigate('/');
            }
        });

        socket.on('player-joined', ({ users }) => {
            setPlayers(users);
            setWaitingForOpponent(users.length < 2);
            if (users.length === 2) {
                const [user1, user2] = users;
                setMySymbol(user1.token === token ? user1.symbol : user2.symbol);
                setIsXNext(user1.symbol === 'X');
            }
        });

        socket.on('move-made', ({ index, player, lobby }) => {
            setBoard(lobby.board);
            setIsXNext(lobby.isXNext);
            setWinner(lobby.winner);
            setIsDraw(lobby.isDraw);
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        return () => {
            socket.off('lobby-joined');
            socket.off('player-joined');
            socket.off('move-made');
        };
    }, [lobbyId, token, navigate, user]);

    const handleClick = (index) => {
        if (!board[index] && !winner && !isDraw && (isXNext ? mySymbol === 'X' : mySymbol === 'O')) {
            socket.emit('make-move', { lobbyId, index, player: { token, symbol: mySymbol } });
        }
    };

    const handleCopyUrl = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url)
    };

    const renderCell = (index) => (
        <Cell onClick={() => handleClick(index)} value={board[index]}>
            {board[index]}
        </Cell>
    );

    if (loading) {
        return <div>Loading...</div>;
    }

    if (waitingForOpponent) {
        return (
            <WaitingContainer>
                <p className='waitingText'>Waiting for opponent to connect to the match...</p>
                <br />
                <div className="loadingio-spinner-spinner-nq4q5u6dq7r">
                    <div className="ldio-x2uulkbinbj">
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                </div>

                <UrlContainer>
                    <UrlBox value={window.location.href} readOnly />
                    <CopyButton onClick={handleCopyUrl}>Share</CopyButton>
                </UrlContainer>

            </WaitingContainer>
        );
    }

    const currentPlayer = isXNext ? players[0] : players[1];
    const winnerPlayer = players.find(p => (p.symbol === winner));

    return (
        <Container>
            <Board>
                <div className="status">
                    {winner ? `Winner: ${winnerPlayer ? winnerPlayer.name : winner}` :
                        isDraw ? 'Game ended in a draw' : `${currentPlayer ? currentPlayer.name : ''}'s turn`}
                </div>
                <Row>
                    {renderCell(0)}
                    {renderCell(1)}
                    {renderCell(2)}
                </Row>
                <Row>
                    {renderCell(3)}
                    {renderCell(4)}
                    {renderCell(5)}
                </Row>
                <Row>
                    {renderCell(6)}
                    {renderCell(7)}
                    {renderCell(8)}
                </Row>
            </Board>
            <PlayerInfo>
                <PlayerName isWinner={winnerPlayer && winnerPlayer.symbol === 'X'}>
                    {players[0] ? players[0].name : 'Player 1'}
                </PlayerName>
                <div>VS</div>
                <PlayerName isWinner={winnerPlayer && winnerPlayer.symbol === 'O'}>
                    {players[1] ? players[1].name : 'Player 2'}
                </PlayerName>
            </PlayerInfo>
        </Container>
    );
};

export default TicTacToeGame;
