import { useState, useEffect, useMemo } from 'react';
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
  CircularProgress,
  Alert,
  Snackbar,
  Box,
  MenuItem,
  Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import '../css/lkw.css';
import AddLkwModal from '../components/addLkw';

function Lkw() {
  const API_URL = 'http://localhost/portusApp1/lkw';

  const [lkws, setLkws] = useState([]);
  const [search, setSearch] = useState('');
  const [sortOption, setSortOption] = useState('number_asc');

  const [open, setOpen] = useState(false);
  const [editLkw, setEditLkw] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const getLkws = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(API_URL);
      console.log('Получены данные LKW:', response.data);
      setLkws(response.data);
    } catch (err) {
      console.error('[Lkw] getLkws error:', err);
      setError('Не удалось загрузить данные о машинах');
      setLkws([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLkws();

    const interval = setInterval(() => {
      getLkws();
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (idMaybe) => {
    const id = idMaybe || null;
    if (!id || !window.confirm('Вы уверены, что хотите удалить машину?')) return;

    try {
      const response = await axios.delete(`${API_URL}/${id}`);
      if (response.data?.status === 200) {
        setSuccessMessage('Машина успешно удалена');
        await getLkws();
      } else {
        setError(response.data?.error || 'Ошибка удаления');
      }
    } catch (err) {
      console.error('[Lkw] handleDelete error:', err);
      setError('Не удалось удалить машину');
    }
  };

  const getStatusColor = (status) => {
    const s = (status || '').trim();
    switch (s) {
      case 'Gut':
      case 'OK':
      case 'Свободно':
        return 'green';
      case 'Beschädigt':
      case 'Проблема':
        return 'red';
      case 'Bald TO':
      case 'Скоро ТО':
        return 'orange';
      default:
        return 'gray';
    }
  };

  // ===== Хелперы для дат и статусов TÜF/ESP =====
  const formatDate = (s) => {
    if (!s) return '—';
    const d = new Date(s);
    if (isNaN(d.getTime())) return String(s).slice(0, 10);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const getDueChip = (dateStr, label) => {
    if (!dateStr) {
      return <Chip label={`${label}: нет даты`} variant="outlined" size="small" />;
    }

    const target = new Date(dateStr);
    if (isNaN(target.getTime())) {
      return <Chip label={`${label}: неверная дата`} color="warning" variant="outlined" size="small" />;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);

    const diffMs = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24)); // дни до даты

    if (diffDays < 0) {
      return (
        <Chip
          label={`${label}: просрочен на ${Math.abs(diffDays)} дн.`}
          color="error"
          variant="filled"
          size="small"
        />
      );
    }

    if (diffDays <= 7) {
      return (
        <Chip
          label={`${label}: скоро (${diffDays} дн.)`}
          color="warning"
          variant="filled"
          size="small"
        />
      );
    }

    return (
      <Chip
        label={`${label}: ок (до ${formatDate(dateStr)})`}
        color="success"
        variant="outlined"
        size="small"
      />
    );
  };

  const filteredAndSortedLkws = useMemo(() => {
    let filtered = lkws.filter((lkw) => {
      const matchesSearch =
        lkw.lkw_nummer?.toLowerCase().includes(search.toLowerCase()) ||
        lkw.modell?.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    });

    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'number_asc':
          return (a.lkw_nummer || '').localeCompare(b.lkw_nummer || '');
        case 'number_desc':
          return (b.lkw_nummer || '').localeCompare(a.lkw_nummer || '');
        case 'year_asc':
          return (a.baujahr || 0) - (b.baujahr || 0);
        case 'year_desc':
          return (b.baujahr || 0) - (a.baujahr || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [lkws, search, sortOption]);

  const handleAdd = () => {
    setEditLkw(null);
    setOpen(true);
  };

  const handleEdit = (lkw) => {
    setEditLkw(lkw);
    setOpen(true);
  };

  // сохраняем данные из модалки (ТОЛЬКО JSON)
  const handleSave = async (data) => {
    try {
      setLoading(true);
      setError('');

      if (editLkw) {
        const lkwId = editLkw.id || editLkw.id_lkw || editLkw._id || editLkw.lkw_id;
        if (!lkwId) {
          setError('Ошибка: ID машины не найден для редактирования');
          return;
        }

        const payload = {
          id: lkwId,
          lkw_nummer: (data.lkw_nummer || '').trim(),
          tuf: data.tuf || null,
          esp: data.esp || null,
          status: (data.status || '').trim() || null,
        };

        const res = await axios.put(API_URL, payload, {
          headers: { 'Content-Type': 'application/json' }
        });
        setSuccessMessage('Машина успешно обновлена');
        console.log('Обновлена машина:', res.data);
      } else {
        const payload = {
          lkw_nummer: (data.lkw_nummer || '').trim(), // <-- исправленное имя ключа
          tuf: data.tuf || null,
          esp: data.esp || null,
          status: (data.status || '').trim() || null,
        };

        console.log('[Lkw] POST payload =', payload);

        const res = await axios.post(API_URL, payload, {
          headers: { 'Content-Type': 'application/json' }
        });
        setSuccessMessage('Машина успешно добавлена');
        console.log('Добавлена машина:', res.data);
      }

      await getLkws();
      setOpen(false);
      setEditLkw(null);
    } catch (error) {
      console.error('[Lkw] handleSave error:', error);
      if (error.response?.data && typeof error.response.data === 'string' && error.response.data.includes('Fatal error')) {
        setError('Ошибка сервера. Проверьте настройки базы данных.');
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError(editLkw ? 'Не удалось обновить машину' : 'Не удалось добавить машину');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="lkw-container">
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

      {/* Боковое фильтр-окно */}
      <Paper className="lkw-sidebar">
        <Typography variant="h6" className="sidebar-title">
          Фильтрация и управление
        </Typography>

        <Box className="filter-section">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
            fullWidth
          >
            Добавить машину
          </Button>
        </Box>

        <Box className="filter-section">
          <TextField
            label="Поиск (номер/модель)"
            variant="outlined"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            size="small"
          />
        </Box>

        <Box className="filter-section">
          <TextField
            select
            label="Сортировка"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            fullWidth
            size="small"
          >
            <MenuItem value="number_asc">Номер ↑</MenuItem>
            <MenuItem value="number_desc">Номер ↓</MenuItem>
            <MenuItem value="year_asc">Год ↑</MenuItem>
            <MenuItem value="year_desc">Год ↓</MenuItem>
          </TextField>
        </Box>
      </Paper>

      {/* Основной контент */}
      <Box className="lkw-content">
        <Typography variant="h4" gutterBottom>
          Список машин
        </Typography>

        <Paper>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Table className="lkw-table">
              <TableHead>
                <TableRow>
                  <TableCell><b>Номер грузовика</b></TableCell>
                  <TableCell><b>TÜF</b></TableCell>
                  <TableCell><b>Статус TÜF</b></TableCell>
                  <TableCell><b>SP</b></TableCell>
                  <TableCell><b>Статус SP</b></TableCell>
                  <TableCell><b>Статус</b></TableCell>
                  <TableCell align="center"><b>Действия</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAndSortedLkws.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      {lkws.length === 0 ? 'Нет данных...' : 'Ничего не найдено по поиску'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedLkws.map((lkw, index) => (
                    <TableRow key={lkw.id_lkw || lkw._id || lkw.id || index}>
                      <TableCell>{lkw.lkw_nummer || '—'}</TableCell>

                      {/* Дата TÜF */}
                      <TableCell>{formatDate(lkw.tuf)}</TableCell>
                      {/* Статус TÜF */}
                      <TableCell>{getDueChip(lkw.tuf, 'TÜF')}</TableCell>

                      {/* Дата ESP */}
                      <TableCell>{formatDate(lkw.esp)}</TableCell>
                      {/* Статус ESP */}
                      <TableCell>{getDueChip(lkw.esp, 'SP')}</TableCell>

                      <TableCell>
                        <Typography
                          sx={{ color: getStatusColor(lkw.status), fontWeight: 'bold' }}
                        >
                          {(lkw.status || '—').trim()}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="primary"
                          onClick={() => handleEdit(lkw)}
                          disabled={loading}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(lkw.id || lkw.id_lkw || lkw._id)}
                          disabled={loading}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </Paper>
      </Box>

      {/* Модалка добавления/редактирования */}
      <AddLkwModal
        open={open}
        handleClose={() => { setOpen(false); setEditLkw(null); }}
        onSave={handleSave}
        initialData={editLkw}
      />
    </Container>
  );
}

export default Lkw;
