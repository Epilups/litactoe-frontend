import axios from "axios"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

const Button = styled.button`
    width: 200px;
    height: 100px;
`



export default function DefaultLayout() {

    const navigate = useNavigate()

    const createGame = async () => {
        try {
            const response = await axios.post('http://localhost:8000/api/create-lobby')
            const { lobbyId } = response.data
            navigate(`/lobby/${lobbyId}`)
        } catch (error) {
            console.error('Error creating lobby:', error);
            alert('Failed to create lobby. Please try again.');
        }
    }


    return (
        <div className="container">

            <Button onClick={createGame}>Create game</Button>
        </div>
    )
}
