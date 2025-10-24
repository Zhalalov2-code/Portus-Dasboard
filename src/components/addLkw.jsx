import { Modal, Box, TextField, Button, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

// Стили модального окна
const style = {
  position: 'absolute',
  top: '50%', left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 420, bgcolor: 'background.paper',
  borderRadius: 2, boxShadow: 24, p: 4,
};

export default function AddLkwModal({
  open = false,
  handleClose = () => {},
  onSave = () => {},
  initialData = null,
}) {
  const [data, setData] = useState({
    lkw_nummer: '',
    tuf: '',
    esp: '',
    status: ''
  });
  const [errors, setErrors] = useState({});

  const normalizeDate = (dateStr) => {
    if (!dateStr || dateStr === '0000-00-00') return '';
    const d = new Date(dateStr);
    return Number.isNaN(d.getTime()) ? '' : dateStr.slice(0, 10);
  };

  useEffect(() => {
    if (initialData) {
      setData({
        lkw_nummer: initialData.lkw_nummer || '',
        tuf: normalizeDate(initialData.tuf),
        esp: normalizeDate(initialData.esp),
        status: initialData.status || ''
      });
    } else {
      setData({ lkw_nummer: '', tuf: '', esp: '', status: '' });
    }
    setErrors({});
  }, [initialData, open]);

  const handleChange = (e) => {
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!data.lkw_nummer.trim()) newErrors.lkw_nummer = 'Введите номер LKW';
    if (!data.tuf) newErrors.tuf = 'Укажите дату TÜF';
    if (!data.esp) newErrors.esp = 'Укажите дату ESP';

    // if (data.tuf && data.esp) {
    //   const lastDate = new Date(data.tuf);
    //   const nextDate = new Date(data.esp);
    //   if (nextDate <= lastDate) newErrors.esp = 'Следующий ТО должен быть позже последнего';
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (typeof onSave !== 'function') {
      console.error('AddLkwModal: onSave должен быть функцией, получено:', onSave);
      return;
    }
    if (!validate()) return;

    // авто-статус по дате следующего ТО (можно убрать, если не нужно)
    const today = new Date();
    const nd = new Date(data.esp);
    let autoStatus = 'Gut';
    if (nd < today) autoStatus = 'Beschädigt';
    else {
      const diffDays = Math.ceil((nd - today) / (1000 * 60 * 60 * 24));
      if (diffDays <= 7) autoStatus = 'Bald Inspektion';
    }

    const payload = {
      lkw_nummer: data.lkw_nummer.trim(),
      tuf: data.tuf,
      esp: data.esp,
      status: data.status || autoStatus,
    };

    onSave(payload);
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h6" gutterBottom>
          {initialData ? 'Редактировать машину' : 'Добавить машину'}
        </Typography>

        <TextField
          label="Номер LKW"
          name="lkw_nummer"
          value={data.lkw_nummer}
          onChange={handleChange}
          fullWidth sx={{ mb: 2 }}
          error={!!errors.lkw_nummer}
          helperText={errors.lkw_nummer}
        />

        <TextField
          label="TÜF"
          name="tuf"
          type="date"
          value={data.tuf}
          onChange={handleChange}
          fullWidth sx={{ mb: 2 }}
          InputLabelProps={{ shrink: true }}
          error={!!errors.tuf}
          helperText={errors.tuf}
        />

        <TextField
          label="SP"
          name="esp"
          type="date"
          value={data.esp}
          onChange={handleChange}
          fullWidth sx={{ mb: 2 }}
          InputLabelProps={{ shrink: true }}
          error={!!errors.esp}
          helperText={errors.esp}
        />

        <TextField
          label="Статус (опционально)"
          name="status"
          value={data.status}
          onChange={handleChange}
          fullWidth sx={{ mb: 2 }}
          placeholder="Оставьте пустым — определим автоматически"
        />

        <Button variant="contained" onClick={handleSubmit} fullWidth>
          Сохранить
        </Button>
      </Box>
    </Modal>
  );
}
