import { useState } from 'react';
import { Container, Box, Paper, Typography, TextField, Button, FormControlLabel, Checkbox, Link, Grid, Alert, CircularProgress, Snackbar } from '@mui/material';
import '../css/auth.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register() {
    const API_URL = 'http://localhost/portusApp1/users/register';
    const [form, setForm] = useState({
        name: '',
        lastname: '',
        email: '',
        password: '',
        confirmPassword: '',
        agree: false,
        role: ''
    });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: name === 'agree' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        // Валидация
        if (!form.name) {
            setError('Введите имя');
            return;
        }
        if (!form.lastname) {
            setError('Введите фамилию');
            return;
        }
        if (!form.email) {
            setError('Введите email');
            return;
        }
        if (!form.password) {
            setError('Введите пароль');
            return;
        }
        if (form.password.length < 6) {
            setError('Пароль должен содержать минимум 6 символов');
            return;
        }
        if (form.password !== form.confirmPassword) {
            setError('Пароли не совпадают');
            return;
        }
        if (!form.agree) {
            setError('Необходимо согласиться с условиями использования');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) {
            setError('Введите корректный email адрес');
            return;
        }

        setLoading(true);

        const formData = {
            name: form.name,
            lastname: form.lastname,
            email: form.email,
            password: form.password,
            confirmPassword: form.confirmPassword,
            agree: form.agree,
            role: form.role
        };

        try {
            const body = new URLSearchParams(formData);
            console.log('Register: Отправляемые данные:', formData);
            console.log('Register: URL запроса:', API_URL);
            
            const response = await axios.post(API_URL, body, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            
            console.log('Register: Полный ответ сервера:', response);
            console.log('Register: HTTP статус:', response.status);
            console.log('Register: Данные ответа:', response.data);
            console.log('Register: Тип данных ответа:', typeof response.data);

            if (typeof response.data === 'string' && response.data.includes('Fatal error')) {
                console.error('Register: Сервер вернул PHP ошибку:', response.data);
                setError('Ошибка сервера. Проверьте настройки базы данных.');
                return;
            }
            
            if (typeof response.data === 'object' && response.data !== null) {
                console.log('Register: Поле user существует?', 'user' in response.data);
                console.log('Register: Значение response.data?.user:', response.data?.user);
            }
            
            if (response.data?.user) {
                localStorage.setItem('currentUser', JSON.stringify(response.data.user));
                console.log('Register: Пользователь сохранен в localStorage');
                
                // Уведомляем навбар об изменении пользователя
                window.dispatchEvent(new Event('userUpdated'));
                
                setSuccessMessage('Регистрация успешна');
                setForm({
                    name: "",
                    lastname: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                    agree: false,   
                    role: ""
                });
                setTimeout(() => {
                    navigate('/profil');
                }, 2000);
            } else {
                console.log('Register: Условие response.data?.user НЕ выполнено');
                console.log('Register: response.data:', response.data);
                if (typeof response.data === 'object' && response.data !== null) {
                    console.log('Register: response.data структура:', JSON.stringify(response.data, null, 2));
                } else {
                    console.log('Register: response.data не является объектом, тип:', typeof response.data);
                }
                setError('Что-то пошло не так');
            }
        } catch (err) {
            console.error('Register: Ошибка при регистрации:', err);
            console.error('Register: Детали ошибки:', {
                message: err.message,
                status: err.response?.status,
                data: err.response?.data
            });
            setError('Ошибка при регистрации');
        } finally {
            setLoading(false);
        }
    }
    return (
        <Container maxWidth="xs" className="auth-container">
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

            <Paper elevation={3} className="auth-paper">
                <Box className="auth-box" component="form" onSubmit={handleSubmit}>
                    <Typography variant="h5" className="auth-title">Регистрация</Typography>
                    <TextField
                        label="Имя"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        fullWidth
                        disabled={loading}
                        required
                    />
                    <TextField
                        label="Фамилия"
                        name="lastname"
                        value={form.lastname}
                        onChange={handleChange}
                        fullWidth
                        disabled={loading}
                        required
                    />
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
                    <TextField
                        label="Подтверждение пароля"
                        type="password"
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        fullWidth
                        disabled={loading}
                        required
                    />
                    <TextField
                        label="Роль"
                        type="text"
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        fullWidth
                        disabled={loading}
                        required
                    />
                    <FormControlLabel
                        control={
                            <Checkbox 
                                name="agree"
                                checked={form.agree} 
                                onChange={handleChange}
                                disabled={loading}
                            />
                        }
                        label="Я соглашаюсь с условиями использования"
                    />
                    <Button 
                        type="submit"
                        variant="contained" 
                        fullWidth 
                        size="large" 
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {loading ? 'Регистрируем...' : 'Зарегистрироваться'}
                    </Button>
                    <Grid container>
                        <Grid size={{ xs: 12 }} className="auth-center">
                            <Typography variant="body2">
                                Уже есть аккаунт? <Link href="/login">Войти</Link>
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Container>
    )
}

export default Register;

