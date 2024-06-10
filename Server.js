import express from 'express';
import http from 'http';
import { Server as SocketIo } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

//setting up __dirname to use ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new SocketIo(server, {
    cors: {
        origin: process.env.NODE_ENV === "production" ? false : ["http://localhost:3000"]
    }
});

app.use(express.static(path.join(__dirname, '/dist')));

app.use('/lobby/:lobbyId', async (req, res, next) => {
    const { lobbyId } = req.params;
    try {
        const response = await axios.get(`http://localhost:8000/api/validate-lobby/${lobbyId}`);
        if (response.data.exists) {
            next();
        } else {
            res.redirect('/');
        }
    } catch (error) {
        console.error('Error validating lobby:', error);
        res.redirect('/');
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/dist', 'index.html'));
});

const lobbies = {};

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('join-lobby', ({ lobbyId, user }) => {
        if (!lobbies[lobbyId]) {
            lobbies[lobbyId] = { users: [], board: Array(9).fill(null), isXNext: true, winner: null, isDraw: false };
        }

        const lobby = lobbies[lobbyId];
        if (lobby.users.length < 2 && !lobby.users.find(u => u.id === user.id)) {
            lobby.users.push(user);
            socket.join(lobbyId);

            if (lobby.users.length === 2) {
                const shuffledUsers = lobby.users.sort(() => 0.5 - Math.random());
                shuffledUsers[0].symbol = 'X';
                shuffledUsers[1].symbol = 'O';
                lobby.users = shuffledUsers;
                lobby.isXNext = shuffledUsers[0].symbol === 'X';
            }

            socket.emit('lobby-joined', { success: true, lobby, user });
            io.to(lobbyId).emit('player-joined', { users: lobby.users });
        } else {
            socket.emit('lobby-joined', { success: false, message: 'Lobby is full or user already joined.' });
        }
        console.log(`User ${user.name} joined lobby: ${lobbyId}`);
    });

    socket.on('make-move', ({ lobbyId, index, player }) => {
        const lobby = lobbies[lobbyId];
        if (!lobby) return;

        const currentPlayer = lobby.isXNext ? 'X' : 'O';
        const user = lobby.users.find(u => u.token === player.token);

        if (lobby.winner || lobby.board[index] || (user && currentPlayer !== player.symbol)) return;

        lobby.board[index] = player.symbol;
        lobby.isXNext = !lobby.isXNext;
        lobby.winner = calculateWinner(lobby.board);
        if (!lobby.winner && !lobby.board.includes(null)) {
            lobby.isDraw = true;
        }

        io.to(lobbyId).emit('move-made', { index, player: player.symbol, lobby });
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

const calculateWinner = (squares) => {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return squares[a];
        }
    }
    return null;
};

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
