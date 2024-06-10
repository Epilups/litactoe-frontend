import { useEffect, useState } from 'react';
import styled from 'styled-components';
import io from 'socket.io-client';
import { useParams, useNavigate } from 'react-router-dom';
import { useStateContext } from '../contexts/ContextProvider';

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
    font-size: 12em;
    margin: 5px;
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: ${(props) => (props.value === 'X' ? 'blue' : props.value === 'O' ? 'red' : '#575757')};
    color: white; /* Ensure the text is visible on colored background */
    border: 2px solid #000;
`;

const WaitingContainer = styled.div`
    display: flex;
    align-items: center;
    flex-direction: column;
    padding-bottom: 160px;
`

const socket = io('https://litactoe-frontend-fe028f89ec3b.herokuapp.com');
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
                <br/>
                <div class="loadingio-spinner-spinner-nq4q5u6dq7r">
                    <div class="ldio-x2uulkbinbj">
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
            </WaitingContainer>
        )
    }

    const currentPlayer = isXNext ? players[0] : players[1];
    const winnerPlayer = players.find(p => (p.symbol === winner));

    return (
        <div className="game">
            <div className="status">
                {winner ? `Winner: ${winnerPlayer ? winnerPlayer.name : winner}` :
                isDraw ? 'Game ended in a draw' : `Next player: ${currentPlayer ? currentPlayer.name : ''}`}
            </div>
            <Board>
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
        </div>
    );
};

export default TicTacToeGame;
