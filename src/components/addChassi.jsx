import { Modal, Box, TextField, Button, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

// Стили модального окна
const style = {
  position: 'absolute',
  top: '50%', left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: 8,
  boxShadow: 24,
  p: 4,
};

export default function AddTrailerModal({ open, handleClose, onSave, initialData }) {
  const [data, setData] = useState({
    chassi_nummer: '',
    tuf: '',
    esp: '',
  });

  const [errors, setErrors] = useState({});

  // Нормализация строки даты в формат yyyy-mm-dd или ''
  const normalizeDate = (dateStr) => {
    if (!dateStr || dateStr === '0000-00-00') return '';
    const d = new Date(dateStr);
    // Если пришла ISO-строка — берем первые 10 символов; иначе возвращаем пусто при невалидности
    if (isNaN(d.getTime())) return '';
    return String(dateStr).slice(0, 10);
  };

  useEffect(() => {
    if (initialData) {
      setData({
        chassi_nummer: initialData.chassi_nummer || '',
        tuf: normalizeDate(initialData.tuf),
        esp: normalizeDate(initialData.esp),
      });
    } else {
      setData({
        chassi_nummer: '',
        tuf: '',
        esp: '',
      });
    }
    setErrors({});
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};

    // chassi_nummer
    if (!data.chassi_nummer.trim()) {
      newErrors.chassi_nummer = 'Введите номер шасси';
    } else if (data.chassi_nummer.trim().length < 3) {
      newErrors.chassi_nummer = 'Номер шасси должен содержать минимум 3 символа';
    }

    // tuf / esp
    if (!data.tuf) newErrors.tuf = 'Укажите дату последнего ТО (TÜV)';
    if (!data.esp) newErrors.esp = 'Укажите дату следующего ТО (ESP)';

    // Проверка порядка дат (если обе указаны)
    // if (data.tuf && data.esp) {
    //   const dTuf = new Date(data.tuf);
    //   const dEsp = new Date(data.esp);
    //   if (!isNaN(dTuf.getTime()) && !isNaN(dEsp.getTime()) && dEsp <= dTuf) {
    //     newErrors.esp = 'Дата ESP должна быть позже TÜV';
    //   }
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const formattedData = {
      chassi_nummer: data.chassi_nummer.trim(),
      tuf: data.tuf || null,
      esp: data.esp || null,
      // status здесь не вычисляем — на странице он пересчитывается по esp
    };

    onSave(formattedData);
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h6" gutterBottom>
          {initialData ? 'Редактировать прицеп' : 'Добавить информацию о прицепе'}
        </Typography>

        <TextField
          label="Номер шасси"
          name="chassi_nummer"
          value={data.chassi_nummer}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
          error={!!errors.chassi_nummer}
          helperText={errors.chassi_nummer}
        />

        <TextField
          label="TÜF"
          name="tuf"
          type="date"
          value={data.tuf}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
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
          fullWidth
          sx={{ mb: 3 }}
          InputLabelProps={{ shrink: true }}
          error={!!errors.esp}
          helperText={errors.esp}
        />

        <Button variant="contained" onClick={handleSubmit} fullWidth>
          Сохранить
        </Button>
      </Box>
    </Modal>
  );
}