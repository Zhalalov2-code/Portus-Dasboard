import { useState, useEffect } from 'react';
import { Container, Paper, Box, Avatar, Typography, Divider, Link, List, ListItem, ListItemIcon, ListItemText, CircularProgress, Alert, Snackbar } from '@mui/material';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import '../css/profile.css';

function Profile() {
    const [user, setUser] = useState({
        name: '',
        lastname: '',
        email: '',
        role: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const loadUserData = async () => {
            setLoading(true);
            try {
                const stored = localStorage.getItem('currentUser');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    console.log('Данные из localStorage:', parsed);
                    console.log('Роль пользователя:', parsed.role || parsed.Role || 'не найдена');
                    
                    setUser({
                        name: parsed.name || parsed.Name || parsed.vorname || parsed.Vorname || '',
                        lastname: parsed.lastname || parsed.Lastname || parsed.nachname || parsed.Nachname || '',
                        email: parsed.email || '',
                        role: parsed.role || parsed.Role || '',
                    });
                } else {
                    setError('Данные пользователя не найдены');
                }
            } catch (error) {
                console.error('Ошибка загрузки данных пользователя:', error);
                setError('Ошибка загрузки данных профиля');
            } finally {
                setLoading(false);
            }
        };

        loadUserData();
    }, []);

    return (
        <Container className="profile-container">
            {/* Уведомления */}
            {error && (
                <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            
            <Snackbar
                open={!!successMessage}
                autoHideDuration={3000}
                onClose={() => setSuccessMessage('')}
            >
                <Alert severity="success" onClose={() => setSuccessMessage('')}>
                    {successMessage}
                </Alert>
            </Snackbar>

            {loading ? (
                <Box display="flex" justifyContent="center" p={4}>
                    <CircularProgress />
                </Box>
            ) : (
                <Paper elevation={0} className="profile-paper">
                    <Box className="profile-header">
                    <Avatar className="profile-avatar">
                        {(user.name || user.lastname) ? `${(user.name||' ')[0]||''}${(user.lastname||' ')[0]||''}`.toUpperCase() : 'U'}
                    </Avatar>
                    <Box>
                        <Typography variant="h6">
                            {[user.name, user.lastname].filter(Boolean).join(' ') || 'Профиль'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">{user.email || 'Управление аккаунтом'}</Typography>
                    </Box>
                </Box>

                <Divider />

                <Box className="profile-sections">

                    <Paper variant="outlined" className="section info-card">
                        <Typography variant="subtitle1" className="section-title">Информация</Typography>
                        <List className="info-list">
                            <ListItem className="info-item">
                                <ListItemIcon className="info-icon"><PersonOutlineIcon fontSize="small" /></ListItemIcon>
                                <ListItemText
                                    primary={<Typography className="info-value">{user.name || '—'}</Typography>}
                                    secondary={<Typography className="info-label">Имя</Typography>}
                                />
                            </ListItem>
                            <ListItem className="info-item">
                                <ListItemIcon className="info-icon"><PersonOutlineIcon fontSize="small" /></ListItemIcon>
                                <ListItemText
                                    primary={<Typography className="info-value">{user.lastname || '—'}</Typography>}
                                    secondary={<Typography className="info-label">Фамилия</Typography>}
                                />
                            </ListItem>
                            <ListItem className="info-item">
                                <ListItemIcon className="info-icon"><MailOutlineIcon fontSize="small" /></ListItemIcon>
                                <ListItemText   
                                    primary={<Typography className="info-value">{user.email ? <Link href={`mailto:${user.email}`}>{user.email}</Link> : '—'}</Typography>}
                                    secondary={<Typography className="info-label">Email</Typography>}
                                />
                            </ListItem>
                            <ListItem className="info-item">
                                <ListItemIcon className="info-icon"><PersonOutlineIcon fontSize="small" /></ListItemIcon>
                                <ListItemText
                                    primary={<Typography className="info-value">{user.role || '—'}</Typography>}
                                    secondary={<Typography className="info-label">Роль</Typography>}
                                />
                            </ListItem>
                        </List>
                    </Paper>

                    
                </Box>
                </Paper>
            )}
        </Container>
    )
}

export default Profile;

