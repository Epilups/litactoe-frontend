import {Outlet} from "react-router-dom";
import TopNavbar from "./TopNavbar.jsx";
import {useEffect} from "react";
import axiosClient from "../axios-client.js";
import {useStateContext} from "../contexts/ContextProvider.jsx";

const MainLayout = () => {

    const {user, token, setUser, setToken} = useStateContext()

    /*
    basically fetches the users data every time this component is rendered
    more useful to do this because user data might update whilst they are still using
    the app/some other stuff. shouldnt be too expensive
    */

    if (token) {
        useEffect(() => {
            axiosClient.get('/user')
                .then(({data}) => {
                    setUser(data)
                })
        }, [])
    }

    return (
        <div>
            <TopNavbar/>
            <div className='mainContent'>
                <Outlet/>
            </div>
        </div>
    )
}

export default MainLayout;
