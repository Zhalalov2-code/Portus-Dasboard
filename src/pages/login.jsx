import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Container, Box, Paper, Typography, TextField, Button, 
    FormControlLabel, Checkbox, Link, Grid, CircularProgress, 
    Alert, Snackbar 
} from '@mui/material';
import '../css/auth.css';
import axios from 'axios';
import { useAuth } from '../utils/authContext';

function Login() {
    const API_URL = 'http://localhost/portusApp1/users/login';
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [showError, setShowError] = useState(false);
    const navigate = useNavigate();
    const [remember, setRemember] = useState(false);        
    const { login } = useAuth();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setShowError(false);

        // Валидация
        if (!form.email || !form.password) {
            setError("Заполните все поля");
            setShowError(true);
            setLoading(false);
            return;
        }

        // Валидация email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) {
            setError("Введите корректный email адрес");
            setShowError(true);
            setLoading(false);
            return;
        }

        try{
            console.log('Отправляем запрос на:', API_URL);
            console.log('Параметры:', { email: form.email, password: form.password });
            
            const res = await axios.get( API_URL, {
                params: { 
                    email: form.email, 
                    password: form.password
                }
            });

            console.log('Полный ответ сервера:', res);
            console.log('Данные ответа:', res.data);
            console.log('Статус ответа:', res.status);

            if (res.data?.user){
                console.log('Данные пользователя при входе:', res.data.user);
                login(res.data.user);
                setSuccessMessage("Успешный вход в систему!");
                setTimeout(() => {
                    navigate("/profil");
                }, 1000);
            } else if (res.data?.error) {
                console.log('Ошибка от сервера:', res.data.error);
                setError(res.data.error);
                setShowError(true);
            } else if (res.data?.message) {
                setError(res.data.message);
                setShowError(true);
            } else {
                console.log('Неожиданный формат ответа:', res.data);
                setError("Неверный email или пароль");
                setShowError(true);
            }
        }catch(err){
            console.error('Ошибка входа:', err);
            
            if (err.code === 'NETWORK_ERROR' || !err.response) {
                setError("Ошибка сети. Проверьте подключение к интернету.");
            } else if (err.response?.status === 404) {
                setError("Сервер не найден. Проверьте настройки сервера.");
            } else if (err.response?.status === 500) {
                setError("Ошибка сервера. Попробуйте позже.");
            } else if (err.response?.data?.includes && err.response.data.includes('Table') && err.response.data.includes("doesn't exist")) {
                setError("Ошибка базы данных: таблица пользователей не найдена");
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError("Неожиданная ошибка. Попробуйте еще раз.");
            }
            
            setShowError(true);
        }finally{
            setLoading(false);
        }
    }

    return (
        <Container maxWidth="xs" className="auth-container">
            {/* Уведомления */}
            {showError && (
                <Alert severity="error" onClose={() => setShowError(false)} sx={{ mb: 2 }}>
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

            <Paper elevation={3} className="auth-paper">
                <Box className="auth-box" component="form" onSubmit={handleSubmit}>
                    <Typography variant="h5" className="auth-title">Вход</Typography>
                    <TextField
                        label="Email"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        fullWidth
                        disabled={loading}
                        required
                    />
                    <TextField
                        label="Пароль"
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        fullWidth
                        disabled={loading}
                        required
                    />
                    <FormControlLabel
                        control={<Checkbox checked={remember} onChange={(e) => setRemember(e.target.checked)} />}
                        label="Запомнить меня"
                    />
                    <Button 
                        type="submit" 
                        variant="contained" 
                        fullWidth 
                        size="large" 
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {loading ? 'Входим...' : 'Войти'}
                    </Button>
                    <Grid container className="auth-links-row">
                        <Grid size={{ xs: 6 }}>
                            <Link href="#" variant="body2">Забыли пароль?</Link>
                        </Grid>
                        <Grid size={{ xs: 6 }} className="text-right">
                            <Link href="/register" variant="body2">Создать аккаунт</Link>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Container>
    )
}

export default Login;