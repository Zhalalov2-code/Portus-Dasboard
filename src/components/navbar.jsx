import { useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { NavLink, useNavigate } from 'react-router-dom';
import '../css/navbar.css';
import { useAuth } from '../utils/authContext';

function Navbar() {
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();

    useEffect(() => {}, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <AppBar position="static">
            <Toolbar className="nav-toolbar">
                <div className="nav-left">
                    <Typography variant="h6" className="nav-brand">
                        Portus Logistics
                    </Typography>
                </div>

                <div className="nav-links">
                    {currentUser && (
                        <>
                            <NavLink to="/chassi">Список прицепов</NavLink>
                            <NavLink to="/fahrer">Список водителей</NavLink>
                            <NavLink to="/lkw">Список машин</NavLink>
                            <NavLink to="/profil">Профиль</NavLink>
                        </>
                    )}
                </div>

                <div className="nav-right">
                    {currentUser ? (
                        <Button color="inherit" onClick={handleLogout}>
                            Выйти
                        </Button>
                    ) : (
                        <>
                            <Button color="inherit" component={NavLink} to="/login">Войти</Button>
                            <Button color="inherit" component={NavLink} to="/register">Регистрация</Button>
                        </>
                    )}
                </div>
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;