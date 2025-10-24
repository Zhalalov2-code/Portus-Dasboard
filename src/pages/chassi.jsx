import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Container, Typography, Table, TableHead, TableRow,
  TableCell, TableBody, Paper, IconButton, TextField, MenuItem, Box,
  CircularProgress, Alert, Snackbar, Dialog, DialogTitle, DialogContent,
  DialogActions, DialogContentText, Button, Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddTrailerModal from '../components/addChassi';
// import CheckCircleIcon from '@mui/icons-material/CheckCircle';
// import WarningIcon from '@mui/icons-material/Warning';
// import ErrorIcon from '@mui/icons-material/Error';
import AddIcon from '@mui/icons-material/Add';
import '../css/chassi.css';
import axios from 'axios';

const API_URL = 'http://localhost/portusApp1/chassi';

// === Расчёт дней до даты ===
function daysLeft(dateStr) {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  if (isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diffMs = target.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

// === Статус на основе ESP ===
function calculateStatus(espDate) {
  const dLeft = daysLeft(espDate);
  if (dLeft < 0) return 'Просрочено';
  if (dLeft <= 7) return 'Скоро Тех. Осмотр';
  return 'В порядке';
}

function ChassiPage() {
  const [open, setOpen] = useState(false);
  const [editChassi, setEditChassi] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Все');
  const [sortOption, setSortOption] = useState('esp_asc');
  const [chassi, setChassi] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, chassiNummer: '' });

  const handleAdd = () => {
    setEditChassi(null);
    setOpen(true);
  };

  const handleEdit = (row) => {
    setEditChassi(row);
    setOpen(true);
  };

  // === Формат даты dd.mm.yyyy ===
  const formatDate = (s) => {
    if (!s) return '—';
    const d = new Date(s);
    if (isNaN(d.getTime())) return String(s).slice(0, 10);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  };

  // === Чип для TÜF/ESP ===
  const getDueChip = (dateStr, label) => {
    if (!dateStr) {
      return <Chip label={`${label}: нет даты`} variant="outlined" size="small" />;
    }
    const dLeft = daysLeft(dateStr);
    if (dLeft === null) {
      return <Chip label={`${label}: неверная дата`} color="warning" variant="outlined" size="small" />;
    }
    if (dLeft < 0) {
      return <Chip label={`${label}: просрочен на ${Math.abs(dLeft)} дн.`} color="error" variant="filled" size="small" />;
    }
    if (dLeft <= 7) {
      return <Chip label={`${label}: скоро (${dLeft} дн.)`} color="warning" variant="filled" size="small" />;
    }
    return <Chip label={`${label}: ок (до ${formatDate(dateStr)})`} color="success" variant="outlined" size="small" />;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'В порядке': return 'green';
      case 'Скоро Тех. Осмотр': return 'orange';
      case 'Просрочено': return 'red';
      default: return 'gray';
    }
  };

  // const getStatusIcon = (status) => {
  //   switch (status) {
  //     case 'В порядке':
  //       return <CheckCircleIcon sx={{ color: 'green', mr: 1 }} />;
  //     case 'Скоро Тех. Осмотр':
  //       return <WarningIcon sx={{ color: 'orange', mr: 1 }} />;
  //     case 'Просрочено':
  //       return <ErrorIcon sx={{ color: 'red', mr: 1 }} />;
  //     default:
  //       return null;
  //   }
  // };

  // === Загрузка ===
  const getChassi = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(API_URL);

      let chassiArray = [];
      if (Array.isArray(response.data)) {
        chassiArray = response.data;
      } else if (response.data && typeof response.data === 'object') {
        if (Array.isArray(response.data.chassi)) chassiArray = response.data.chassi;
        else if (Array.isArray(response.data.data)) chassiArray = response.data.data;
        else chassiArray = [response.data];
      }

      const mapped = chassiArray.map(item => ({
        ...item,
        status: calculateStatus(item.esp)
      }));

      setChassi(mapped);
    } catch (e) {
      console.error('[Chassi] getChassi error]:', e);
      setError('Не удалось загрузить данные о шасси');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getChassi();

    const interval = setInterval(() => {
      getChassi();
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [getChassi]);

  // === Сохранение ===
  const handleSave = async (data) => {
    try {
      setLoading(true);
      setError('');

      if (editChassi) {
        const chassiId = editChassi.id_chassi || editChassi.id || editChassi._id || editChassi.chassi_id;
        if (!chassiId) {
          setError('Ошибка: ID шасси не найден для редактирования');
          return;
        }

        const payload = {
          id: chassiId,
          id_chassi: chassiId,
          chassi_nummer: (data.chassi_nummer || '').trim(),
          tuf: data.tuf || null,
          esp: data.esp || null,
          status: (data.status || '').trim() || null
        };

        await axios.put(API_URL, payload, { headers: { 'Content-Type': 'application/json' } });
        setSuccessMessage('Шасси успешно обновлено');
      } else {
        const payload = {
          chassi_nummer: (data.chassi_nummer || '').trim(),
          tuf: data.tuf || null,
          esp: data.esp || null,
          status: (data.status || '').trim() || null
        };

        await axios.post(API_URL, payload, { headers: { 'Content-Type': 'application/json' } });
        setSuccessMessage('Шасси успешно добавлено');
      }

      await getChassi();
      setOpen(false);
      setEditChassi(null);
    } catch (e) {
      console.error('[Chassi] handleSave error:', e);
      if (e.response?.data && typeof e.response.data === 'string' && e.response.data.includes('Fatal error')) {
        setError('Ошибка сервера. Проверьте настройки базы данных.');
      } else if (e.response?.data?.error) {
        setError(e.response.data.error);
      } else {
        setError(editChassi ? 'Не удалось обновить шасси' : 'Не удалось добавить шасси');
      }
    } finally {
      setLoading(false);
    }
  };

  // === Удаление ===
  const deleteChassi = async (id) => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await axios.delete(`${API_URL}/delete/${id}`);
      if (response.data?.status === 200) {
        setSuccessMessage('Шасси успешно удалено');
        await getChassi();
      } else {
        setError(response.data?.error || 'Ошибка удаления');
      }
    } catch (e) {
      console.error('[Chassi] deleteChassi error:', e);
      setError('Ошибка удаления шасси');
    } finally {
      setLoading(false);
      setDeleteDialog({ open: false, id: null, chassiNummer: '' });
    }
  };

  // === Фильтрация и сортировка ===
  const filteredAndSortedChassi = useMemo(() => {
    let filtered = chassi.filter(item => {
      const num = (item.chassi_nummer || '').toString().toLowerCase();
      const matchesSearch = num.includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'Все' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'esp_asc':
          return new Date(a.esp || '2100-01-01') - new Date(b.esp || '2100-01-01');
        case 'esp_desc':
          return new Date(b.esp || '1900-01-01') - new Date(a.esp || '1900-01-01');
        case 'number_asc':
          return (a.chassi_nummer || '').localeCompare(b.chassi_nummer || '');
        case 'number_desc':
          return (b.chassi_nummer || '').localeCompare(a.chassi_nummer || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [chassi, search, statusFilter, sortOption]);

  return (
    <Container className="chassi-container">
      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Snackbar open={!!successMessage} autoHideDuration={3000} onClose={() => setSuccessMessage('')}>
        <Alert severity="success" onClose={() => setSuccessMessage('')}>{successMessage}</Alert>
      </Snackbar>

      {/* Боковая панель */}
      <Paper className="chassi-sidebar">
        <Typography variant="h6" className="sidebar-title">Фильтрация и управление</Typography>

        <Box className="filter-section">
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd} fullWidth>
            Добавить шасси
          </Button>
        </Box>

        <Box className="filter-section">
          <TextField
            label="Поиск (номер шасси)"
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
            label="Фильтр по статусу"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            fullWidth
            size="small"
          >
            {['Все', 'В порядке', 'Скоро Тех. Осмотр', 'Просрочено'].map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>
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
            <MenuItem value="esp_asc">SP ↑ ближайшие</MenuItem>
            <MenuItem value="esp_desc">SP ↓ дальние</MenuItem>
            <MenuItem value="number_asc">Номер ↑</MenuItem>
            <MenuItem value="number_desc">Номер ↓</MenuItem>
          </TextField>
        </Box>
      </Paper>

      {/* Основной контент */}
      <Box className="chassi-content">
        <Typography variant="h4" gutterBottom>Список шасси</Typography>

        <Paper>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
          ) : (
            <Table className="chassi-table">
              <TableHead>
                <TableRow>
                  <TableCell><b>Номер шасси</b></TableCell>
                  <TableCell><b>TÜF</b></TableCell>
                  <TableCell><b>Статус TÜF</b></TableCell>
                  <TableCell><b>SP</b></TableCell>
                  <TableCell><b>Статус SP</b></TableCell>
                  <TableCell><b>Статус</b></TableCell>
                  <TableCell align="center"><b>Действия</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAndSortedChassi.length === 0 ? (
                  <TableRow key="no-data">
                    <TableCell colSpan={7} align="center">
                      {chassi.length === 0 ? 'Данные не найдены' : 'Ничего не найдено по фильтрам'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedChassi.map((row) => (
                    <TableRow key={row.id_chassi || row._id || row.id}>
                      <TableCell>{row.chassi_nummer || '—'}</TableCell>

                      {/* TÜF + статус */}
                      <TableCell>{formatDate(row.tuf)}</TableCell>
                      <TableCell>{getDueChip(row.tuf, 'TÜF')}</TableCell>

                      {/* ESP + чип/иконка/текст */}
                      <TableCell>{formatDate(row.esp)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          {getDueChip(row.esp, 'SP')}
                        </Box>
                      </TableCell>

                      {/* Общий статус (дублируем текстом, если хочешь — можно убрать этот столбец) */}
                      <TableCell>
                        <Typography sx={{ color: getStatusColor(row.status), fontWeight: 'bold' }}>
                          {'-'}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <IconButton color="primary" onClick={() => handleEdit(row)} disabled={loading}>
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() =>
                            setDeleteDialog({
                              open: true,
                              id: row.id_chassi || row._id || row.id,
                              chassiNummer: row.chassi_nummer || ''
                            })
                          }
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

      <AddTrailerModal
        open={open}
        handleClose={() => { setOpen(false); setEditChassi(null); }}
        onSave={handleSave}
        initialData={editChassi}
      />

      {/* Диалог подтверждения удаления */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null, chassiNummer: '' })}
      >
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите удалить шасси <strong>{deleteDialog.chassiNummer || deleteDialog.id}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: null, chassiNummer: '' })}>Отмена</Button>
          <Button onClick={() => deleteChassi(deleteDialog.id)} color="error" variant="contained" disabled={loading}>
            {loading ? 'Удаление...' : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default ChassiPage;
