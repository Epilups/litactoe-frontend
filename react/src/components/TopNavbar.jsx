import styled from 'styled-components'
import {Link, Navigate, useNavigate} from "react-router-dom";
import axiosClient from "../axios-client.js";
import {useStateContext} from "../contexts/ContextProvider.jsx";
import router from "../router.jsx";

const NavbarContainer = styled.nav`
    height: 110px;
    background: linear-gradient(180deg, rgb(48, 45, 45) 10%, rgb(34, 33, 37) 45%, rgb(22, 21, 18) 100%);
    display: flex;
    justify-content: space-between;
    align-items: start;
    padding: 10px 20px;
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
`;

const NavItem = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownContent = styled.div`
  display: none;
  position: absolute;
  background-color: #3f3f3f;
  min-width: 160px;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
  z-index: 1;
  border-radius: 5px;

  ${NavItem}:hover & {
    display: block;
  }
`;

const DropdownLink = styled(Link)`
  color: white;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  border-radius: 5px;

  &:hover {
    background-color: #575757;
  }
`;

const Button = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.5em;
  cursor: pointer;
  padding: 10px;

  &:hover {
    color: #a19da3;
  }
`;

const LogoButton = styled.button`
    background: none;
    border: none;
    color: white;
    font-size: 3.5em;
    cursor: pointer;

    &:hover {
        color: #a19da3;
    }
`;

//styling the account button seperately because the css gets messed up if i use the other one lol
const AccountDropdownContent = styled(DropdownContent)`
  right: 0;
`;



export default function TopNavbar() {

    const {user, token, setUser, setToken} = useStateContext()

    const onLogout = (ev) => {
        ev.preventDefault()

        axiosClient.post('/logout')
            .then(() => {
                setUser({})
                setToken(null)
            })
            .catch(err => {
                console.error("Logout failed", err)
            })
    }

    return (
        <NavbarContainer>
            <LogoButton onClick={() => router.navigate('/')}>
                litactoe
            </LogoButton>

            <NavLinks>

                <NavItem>
                    <Button>PLAY</Button>
                    <DropdownContent>
                        <DropdownLink to="/lobby">Create a game</DropdownLink>
                    </DropdownContent>
                </NavItem>

            </NavLinks>

            <NavItem>
                <Button>{token ? user.name : "ACCOUNT"}</Button>
                <AccountDropdownContent>
                    {!token && <DropdownLink to="/login">Sign in</DropdownLink>}
                    {token && <DropdownLink to="/" onClick={onLogout}>Sign out</DropdownLink>}
                </AccountDropdownContent>
            </NavItem>
        </NavbarContainer>
    );
}

