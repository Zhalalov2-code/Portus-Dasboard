import { useEffect } from 'react';
import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Box,
    Avatar,
    Divider,
    Typography
} from '@mui/material';
import {
    RvHookup as TrailerIcon, // Используем иконку прицепа
    Person as PersonIcon,
    LocalShipping,
    AccountCircle as ProfileIcon,
    Logout as LogoutIcon,
    Login as LoginIcon,
    PersonAdd as RegisterIcon
} from '@mui/icons-material';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/authContext';
import '../css/navbar.css';

// Фиксированная ширина боковой панели
const DRAWER_WIDTH = 280;

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser, logout } = useAuth();

    useEffect(() => {}, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    /**
     * Навигационные элементы для авторизованных пользователей
     */
    const navigationItems = [
        {
            id: 'chassi',
            label: 'Список прицепов',
            icon: <TrailerIcon />,
            path: '/chassi'
        },
        {
            id: 'fahrer',
            label: 'Список водителей',
            icon: <PersonIcon />,
            path: '/fahrer'
        },
        {
            id: 'lkw',
            label: 'Список грузовиков',
            icon: <LocalShipping />,
            path: '/lkw'
        },
        {
            id: 'profil',
            label: 'Профиль',
            icon: <ProfileIcon />,
            path: '/profil'
        }
    ];

    /**
     * Проверка активности пути
     */
    const isActivePath = (path) => {
        return location.pathname === path || location.pathname.startsWith(path);
    };

    return (
        <Drawer
            variant="permanent"
            className="side-navbar"
            sx={{
                width: DRAWER_WIDTH,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: DRAWER_WIDTH,
                    boxSizing: 'border-box',
                    overflowX: 'hidden',
                    background: 'var(--surface-color)',
                    borderRight: '1px solid var(--divider-color)',
                    boxShadow: 'var(--box-shadow-lg)',
                    position: 'fixed',
                    height: '100vh',
                    zIndex: 1200
                },
            }}
        >
            {/* Заголовок с логотипом */}
            <Box className="side-navbar-header">
                <Typography className="nav-brand">
                    Portus Logistics
                </Typography>
            </Box>

            <Divider sx={{ borderColor: 'var(--divider-color)' }} />

            {/* Информация о пользователе */}
            {currentUser && (
                <>
                    <Box className="side-navbar-user">
                        <Avatar
                            src={currentUser.avatar}
                            sx={{ 
                                width: 40, 
                                height: 40,
                                bgcolor: 'var(--primary-color)'
                            }}
                        >
                            {currentUser.name?.[0] || currentUser.lastname?.[0] || 'U'}
                        </Avatar>
                        
                        <Box className="user-info">
                            <Typography className="user-name">
                                {currentUser.name || currentUser.lastname || 'Пользователь'}
                            </Typography>
                            <Typography className="user-role">
                                {currentUser.role || 'Сотрудник'}
                            </Typography>
                        </Box>
                    </Box>
                    <Divider sx={{ borderColor: 'var(--divider-color)' }} />
                </>
            )}

            {/* Навигационное меню */}
            <List className="side-navbar-nav">
                {currentUser ? (
                    // Меню для авторизованных пользователей
                    navigationItems.map((item) => (
                        <ListItem key={item.id} disablePadding>
                            <ListItemButton
                                component={NavLink}
                                to={item.path}
                                className={`nav-item ${isActivePath(item.path) ? 'active' : ''}`}
                                sx={{
                                    minHeight: 48,
                                    px: 2.5,
                                }}
                            >
                                <ListItemIcon className="nav-icon">
                                    {item.icon}
                                </ListItemIcon>
                                
                                <ListItemText 
                                    primary={item.label}
                                    className="nav-text"
                                />
                            </ListItemButton>
                        </ListItem>
                    ))
                ) : (
                    // Меню для неавторизованных пользователей
                    <>
                        <ListItem disablePadding>
                            <ListItemButton
                                component={NavLink}
                                to="/login"
                                className={`nav-item ${isActivePath('/login') ? 'active' : ''}`}
                                sx={{
                                    minHeight: 48,
                                    px: 2.5,
                                }}
                            >
                                <ListItemIcon className="nav-icon">
                                    <LoginIcon />
                                </ListItemIcon>
                                
                                <ListItemText 
                                    primary="Войти"
                                    className="nav-text"
                                />
                            </ListItemButton>
                        </ListItem>

                        <ListItem disablePadding>
                            <ListItemButton
                                component={NavLink}
                                to="/register"
                                className={`nav-item ${isActivePath('/register') ? 'active' : ''}`}
                                sx={{
                                    minHeight: 48,
                                    px: 2.5,
                                }}
                            >
                                <ListItemIcon className="nav-icon">
                                    <RegisterIcon />
                                </ListItemIcon>
                                
                                <ListItemText 
                                    primary="Регистрация"
                                    className="nav-text"
                                />
                            </ListItemButton>
                        </ListItem>
                    </>
                )}
            </List>

            {/* Нижнее меню - кнопка выхода */}
            {currentUser && (
                <>
                    <Box sx={{ mt: 'auto' }}>
                        <Divider sx={{ borderColor: 'var(--divider-color)' }} />
                        <List className="side-navbar-footer">
                            <ListItem disablePadding>
                                <ListItemButton
                                    onClick={handleLogout}
                                    className="footer-item logout"
                                    sx={{
                                        minHeight: 48,
                                        px: 2.5,
                                    }}
                                >
                                    <ListItemIcon className="nav-icon">
                                        <LogoutIcon />
                                    </ListItemIcon>
                                    
                                    <ListItemText 
                                        primary="Выйти"
                                        className="nav-text"
                                    />
                                </ListItemButton>
                            </ListItem>
                        </List>

                        {/* Информация о версии */}
                        <Box className="app-version">
                            <Typography variant="caption">
                                Версия 1.0.0
                            </Typography>
                        </Box>
                    </Box>
                </>
            )}
        </Drawer>
    );
}

export default Navbar;