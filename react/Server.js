import express from 'express'
import http from 'http'
import { Server as SocketIo } from 'socket.io'
import path from 'path'
import { fileURLToPath } from 'url'

//setting up __dirname to use ES6 modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


const app = express()
const server = http.createServer(app)
const io = new SocketIo(server, {
    cors: {
        origin: process.env.NODE_ENV === "production" ? false :
            ["http://localhost:3000"]
    }
})

//serve static files from the vite build directory
app.use(express.static(path.join(__dirname, '/dist')))

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/dist', 'index.html'))
})

io.on('connection', (socket) => {
    console.log(`A user connected`)

    socket.on('message', (msg) => {
        io.emit('message', msg)
    })

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
})

const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})

