import {createBrowserRouter} from "react-router-dom";
import Login from "./views/Login.jsx";
import Signup from "./views/Signup.jsx";
import NotFound from "./views/NotFound.jsx";
import DefaultLayout from "./components/DefaultLayout.jsx";
import MainLayout from "./components/MainLayout.jsx";
import Lobby from "./views/Lobby.jsx";

const router = createBrowserRouter([
    {
        path:'/',
        element: <MainLayout/>,
        children: [

            {path: '', element: <DefaultLayout/>},
            {path: 'login', element: <Login/>},
            {path: 'signup', element: <Signup/>},
            {path: 'lobby', element: <Lobby/>},

        ]

    },
    {
        path: '*',
        element: <NotFound/>
    },


])

export default router
