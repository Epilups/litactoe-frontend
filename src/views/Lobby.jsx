import io from 'socket.io-client'
import {useEffect, useState} from "react";
import {useStateContext} from "../contexts/ContextProvider.jsx";
import axiosClient from "../axios-client.js";

const socket = io('http://localhost:3001')

const Lobby = () => {

    const {user, token, setUser} = useStateContext()

    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState([])

    useEffect(() => {
        socket.on('message', (msg) => {
            setMessages((prevMessages) => [...prevMessages, msg])
        })

        return () => {
            socket.off('message')
        }
    }, [])

    const sendMessage = (e) => {
        e.preventDefault()

        const msg = {
            user: user.name,
            text: message
        }
        socket.emit('message', msg)
        setMessage('')

    }

    return (
        <div className="container">
            <h1>Lobby</h1>
            <form onSubmit={sendMessage}>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message"
                />
                <button type="submit">Send</button>
            </form>
            <div>
                <h2>Messages:</h2>
                <ul>
                    {messages.map((msg, index) => (
                        <li key={index}>
                            <strong>{msg.user}</strong>: {msg.text}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default Lobby
