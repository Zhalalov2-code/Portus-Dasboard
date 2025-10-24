import {useState, useEffect} from 'react';
import axios from 'axios';
import {
    Container,
    Typography,
    Button,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper,
    IconButton,
    TextField,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Alert,
    Snackbar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import '../css/fahrer.css';

function FahrerPage() {
    const API_URL = '/portusApp1/fahrer';
    const [drivers, setDrivers] = useState([]);
    const [search, setSearch] = useState('');
    const [open, setOpen] = useState(false);
    const [editDriver, setEditDriver] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [formData, setFormData] = useState({
        name: '', lastname: '', email: '', password: '', chassi: '', lkw: '', phone: ''
    });

    const getDrivers = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await axios.get(API_URL);
            console.log('Ответ сервера:', response.data);

            let driversArray = [];
            if (Array.isArray(response.data)) {
                driversArray = response.data;
            } else if (response.data && typeof response.data === 'object') {
                if (response.data.drivers && Array.isArray(response.data.drivers)) {
                    driversArray = response.data.drivers;
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    driversArray = response.data.data;
                } else {
                    driversArray = [response.data];
                }
            }

            setDrivers(driversArray);
        } catch (error) {
            console.error('Ошибка загрузки водителей:', error);
            setError('Не удалось загрузить данные о водителях');
            setDrivers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        try {
            setLoading(true);
            setError('');

            // Валидация данных перед отправкой
            if (!formData.name || !formData.lastname || !formData.email) {
                setError('Заполните обязательные поля: имя, фамилия, email');
                setLoading(false);
                return;
            }

            let response;

            if (editDriver) {
                // Редактирование - используем PUT
                const driverId = editDriver._id || editDriver.id;
                response = await axios.put(`${API_URL}/${driverId}`, formData);
            } else {
                // Добавление - используем POST с URLSearchParams (как в chassi.jsx)
                const formUrlEncoded = new URLSearchParams();
                Object.keys(formData).forEach(key => {
                    if (formData[key]) { // Отправляем только заполненные поля
                        formUrlEncoded.append(key, formData[key]);
                    }
                });

                response = await axios.post(API_URL, formUrlEncoded, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });
            }

            console.log('Ответ сервера:', response.data);

            // Проверяем успешность операции
            if (response.data?.success || response.data?.driver || response.status === 200) {
                setSuccessMessage(editDriver ? 'Водитель успешно обновлен' : 'Водитель успешно добавлен');
                await getDrivers();
                setOpen(false);
                setEditDriver(null);
                setFormData({name: '', lastname: '', email: '', password: '', chassi: '', lkw: '', phone: ''});
            } else {
                setError(response.data?.error || response.data?.message || 'Неизвестная ошибка при сохранении');
            }
        } catch (error) {
            console.error('Ошибка операции:', error);
            console.error('Ответ сервера:', error.response?.data);

            const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Неизвестная ошибка';

            setError(`Не удалось ${editDriver ? 'обновить' : 'добавить'} водителя: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (driver) => {
        setEditDriver(driver);
        setFormData({
            name: driver.name || '',
            lastname: driver.lastname || '',
            email: driver.email || '',
            password: driver.password || '',
            chassi: driver.chassi || '',
            lkw: driver.lkw || '',
            phone: driver.phone || ''
        });
        setOpen(true);
    };

    const handleDelete = (id) => {
        console.log('Удалить водителя:', id);
    };

    const handleFormChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const filteredDrivers = drivers.filter(driver => {
        if (!driver.name || !driver.email) return false;
        const matchesSearch = driver.name.toLowerCase().includes(search.toLowerCase()) || driver.email.toLowerCase().includes(search.toLowerCase());

        return matchesSearch;
    });

    useEffect(() => {
        getDrivers()
    }, [])

    return (<Container className="fahrer-container">
            {/* Уведомления */}
            {error && (<Alert severity="error" onClose={() => setError('')} sx={{mb: 2}}>
                    {error}
                </Alert>)}

            <Snackbar
                open={!!successMessage}
                autoHideDuration={3000}
                onClose={() => setSuccessMessage('')}
            >
                <Alert severity="success" onClose={() => setSuccessMessage('')}>
                    {successMessage}
                </Alert>
            </Snackbar>

            {/* Боковое фильтр-окно */}
            <Paper className="fahrer-sidebar">
                <Typography variant="h6" className="sidebar-title">Фильтрация и управление</Typography>

                <div className="filter-section">
                    {/* <Button
                        variant="contained"
                        fullWidth
                        onClick={() => {
                            setOpen(true);
                            setEditDriver(null);
                            setFormData({name: '', lastname: '', email: '', password: '', chassi: '', lkw: ''});
                        }}
                    >
                        Добавить водителя
                    </Button> */}
                </div>

                <div className="filter-section">
                    <TextField
                        label="Поиск (имя, фамилия, email)"
                        variant="outlined"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        fullWidth
                        size="small"
                    />
                </div>
            </Paper>

            {/* Основной контент */}
            <div className="fahrer-content">
                <Typography variant="h4" gutterBottom>Управление водителями</Typography>

                <Paper>
                    {loading ? (<div className="loading-spinner">
                            <CircularProgress/>
                        </div>) : (<Table className="fahrer-table">
                            <TableHead>
                                <TableRow>
                                    <TableCell><b>Имя</b></TableCell>
                                    <TableCell><b>Фамилия</b></TableCell>
                                    <TableCell><b>Email</b></TableCell>
                                    <TableCell><b>Машина</b></TableCell>
                                    <TableCell><b>Шасси</b></TableCell>
                                    <TableCell><b>Телефон</b></TableCell>
                                    <TableCell align="center"><b>Действия</b></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredDrivers.length === 0 ? (<TableRow>
                                        <TableCell colSpan={6} align="center">
                                            {drivers.length === 0 ? 'Нет водителей' : 'Ничего не найдено по поиску'}
                                        </TableCell>
                                    </TableRow>) : (filteredDrivers.map((driver, index) => (
                                        <TableRow key={driver._id || driver.id || index}>
                                            <TableCell>
                                                <div className="table-cell-content">
                                                    {driver.name}
                                                </div>
                                            </TableCell>
                                            <TableCell>{driver.lastname}</TableCell>
                                            <TableCell>
                                                <div className="table-cell-content">
                                                    {driver.email}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="table-cell-content">
                                                    {driver.lkw}
                                                </div>
                                            </TableCell>
                                            <TableCell>{driver.chassi}</TableCell>
                                            <TableCell>{driver.phone}</TableCell>
                                            <TableCell align="center">
                                                <IconButton color="primary" onClick={() => handleEdit(driver)}>
                                                    <EditIcon/>
                                                </IconButton>
                                                <IconButton color="error" onClick={() => handleDelete(driver._id)}>
                                                    <DeleteIcon/>
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>)))}
                            </TableBody>
                        </Table>)}
                </Paper>
            </div>

            {/* Модальное окно добавления/редактирования */}
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editDriver ? 'Редактировать водителя' : 'Добавить водителя'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{mt: 1}}>
                        <Grid size={{xs: 12, sm: 6}}>
                            <TextField
                                name="name"
                                label="Имя"
                                value={formData.name}
                                onChange={handleFormChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid size={{xs: 12, sm: 6}}>
                            <TextField
                                name="lastname"
                                label="Фамилия"
                                value={formData.lastname}
                                onChange={handleFormChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid size={{xs: 12, sm: 6}}>
                            <TextField
                                name="email"
                                label="Email"
                                value={formData.email}
                                onChange={handleFormChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid size={{xs: 12, sm: 6}}>
                            <TextField
                                name="password"
                                label="Пароль"
                                type="password"
                                value={formData.password}
                                onChange={handleFormChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid size={{xs: 12}}>
                            <TextField
                                name="lkw"
                                label="Машина"
                                value={formData.lkw}
                                onChange={handleFormChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid size={{xs: 12}}>
                            <TextField
                                name="chassi"
                                label="Шасси"
                                value={formData.chassi}
                                onChange={handleFormChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid size={{xs: 12}}>
                            <TextField
                                name="phone"
                                label="Телефон"
                                value={formData.phone}
                                onChange={handleFormChange}
                                fullWidth
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)} disabled={loading}>Отмена</Button>
                    <Button
                        variant="contained"
                        onClick={handleAdd}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} color="inherit"/> : null}
                    >
                        {loading ? (editDriver ? 'Сохраняем...' : 'Добавляем...') : (editDriver ? 'Сохранить' : 'Добавить')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>);
}

export default FahrerPage;
