import io from 'socket.io-client'
import {useEffect, useState} from "react";
import {useStateContext} from "../contexts/ContextProvider.jsx";
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import TicTacToeGame from '../components/game.jsx';


const Lobby = () => {

    const { lobbyId } = useParams()
    const navigate = useNavigate()

    useEffect(() => {

        const validateLobby = async () => {
            try {
                const response = await axios.get(`https://litactoe-03e783c6e51a.herokuapp.com/api/validate-lobby/${lobbyId}`)
                //http://localhost:8000/api/validate-lobby/${lobbyId}
                //https://litactoe-03e783c6e51a.herokuapp.com/api/validate-lobby/${lobbyId}

                if(!response.data.exists) {
                    navigate('/')
                }
            } catch (error) {
                console.error('Error validating lobby:', error)
                navigate('/')
            }
        }

        validateLobby()

    }, [lobbyId, navigate])

    return (
        <div className="container">
            
            <TicTacToeGame/>
        </div>
        
    )
}

export default Lobby
