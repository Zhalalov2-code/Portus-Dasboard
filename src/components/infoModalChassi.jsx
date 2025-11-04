import { useEffect, useRef, useState } from "react";
import {            
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, TextField, Button, Stack, Typography, Box, Chip
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";

// Добавляем API_BASE
const API_BASE = 'http://localhost/portusApp1';

export default function InfoModalChassi({ open, onClose, chassisId, adminUserId }) {
  const [items, setItems] = useState([]);      // сообщения
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [since, setSince] = useState(null);    // для инкрементальных апдейтов
  const bottomRef = useRef(null); // исправили лишнюю точку с запятой и переместили комментарий

  function scrollToBottom() {
    console.log('[InfoModalChassi] scrollToBottom: прокрутка к низу');
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function fetchMessages(initial=false) {
    if (!chassisId) {
      console.warn('[InfoModalChassi] fetchMessages: chassisId отсутствует');
      return;
    }
    const params = { chassis_id: chassisId, limit: 200 };
    if (since && !initial) params.since = since;
    
    try {
      console.log('[InfoModalChassi] fetchMessages: запуск', { chassisId, initial, params });
      const { data } = await axios.get(`${API_BASE}/api/chassis_messages.php`, { params });
      console.log('[InfoModalChassi] fetchMessages: получены данные', data);
      
      const newItems = data.items || [];
      if (initial) {
        setItems(newItems);
        console.log('[InfoModalChassi] fetchMessages: установлены начальные сообщения', newItems.length);
      } else if (newItems.length) {
        setItems(prev => [...prev, ...newItems]);
        console.log('[InfoModalChassi] fetchMessages: добавлены новые сообщения', newItems.length);
      }
      
      // обновим since последним created_at
      const last = (initial ? newItems : (newItems.length ? newItems : items)).slice(-1)[0];
      if (last?.created_at) {
        setSince(last.created_at);
        console.log('[InfoModalChassi] fetchMessages: обновлен since', last.created_at);
      }
      setTimeout(scrollToBottom, 100);
    } catch (e) { 
      console.error('[InfoModalChassi] fetchMessages: ошибка', e);
    }
  }

  useEffect(() => {
    console.log('[InfoModalChassi] useEffect: изменение open/chassisId', { open, chassisId });
    if (open) {
      setItems([]); 
      setSince(null);
      fetchMessages(true);
      const id = setInterval(() => fetchMessages(false), 10000); // 10s pull
      return () => {
        console.log('[InfoModalChassi] useEffect: очистка интервала');
        clearInterval(id);
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, chassisId]);

  async function handleSend() {
    if (!text && files.length === 0) {
      console.warn('[InfoModalChassi] handleSend: нет текста и файлов');
      return;
    }
    
    console.log('[InfoModalChassi] handleSend: отправка сообщения', { text, filesCount: files.length });
    setLoading(true);
    
    try {
      const fd = new FormData();
      fd.append("chassis_id", chassisId);
      fd.append("sender_type", "admin");           // в админке отправляет админ
      fd.append("sender_id", adminUserId || "");
      if (text) fd.append("text", text);
      for (const f of files) fd.append("files[]", f);

      await axios.post(`${API_BASE}/api/chassis_messages_create.php`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log('[InfoModalChassi] handleSend: сообщение отправлено успешно');
      setText(""); 
      setFiles([]);
      await fetchMessages(false); // сразу подгрузим новые
      scrollToBottom();
    } catch (e) { 
      console.error('[InfoModalChassi] handleSend: ошибка отправки', e);
    }
    finally { 
      setLoading(false);
      console.log('[InfoModalChassi] handleSend: загрузка завершена');
    }
  }

  function bubbleBg(sender_type) {
    return sender_type === "admin" ? "#e3f2fd" : "#f1f8e9";
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        Чат по шасси #{chassisId}
        <IconButton onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ minHeight: 420 }}>
        <Stack spacing={1.5}>
          {items.map(m => (
            <Box key={m.id} sx={{
              alignSelf: m.sender_type === "admin" ? "flex-end" : "flex-start",
              maxWidth: "85%"
            }}>
              <Box sx={{
                bgcolor: bubbleBg(m.sender_type),
                p: 1.2, borderRadius: 2
              }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                  <Chip size="small" label={m.sender_type === "admin" ? "Admin" : "Fahrer"} />
                  <Typography variant="caption" color="text.secondary">
                    {new Date(m.created_at).toLocaleString()}
                  </Typography>
                </Stack>
                {m.text && <Typography sx={{ whiteSpace: 'pre-wrap' }}>{m.text}</Typography>}

                {m.attachments?.length > 0 && (
                  <Box sx={{ mt: 1, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px,1fr))", gap: 1 }}>
                    {m.attachments.map(a => (
                      <a key={a.id || a.file_path} href={`/${a.file_path}`} target="_blank" rel="noreferrer">
                        <img
                          src={`/${a.file_path}`}
                          alt="att"
                          style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 8 }}
                          loading="lazy"
                        />
                      </a>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          ))}
          <div ref={bottomRef} />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 2, py: 1.5 }}>
        <Stack direction="row" spacing={1} sx={{ width: "100%" }} alignItems="center">
          <Button variant="outlined" component="label">
            Фото
            <input
              hidden
              multiple
              accept="image/jpeg,image/png,image/webp"
              type="file"
              onChange={(e) => {
                const fileList = Array.from(e.target.files || []);
                console.log('[InfoModalChassi] файлы выбраны:', fileList.length);
                setFiles(fileList);
              }}
            />
          </Button>
          {files.length > 0 && (
            <Typography variant="caption">{files.length} файл(ов) выбрано</Typography>
          )}
          <TextField
            size="small"
            fullWidth
            placeholder="Написать сообщение…"
            value={text}
            onChange={(e)=>setText(e.target.value)}
            onKeyDown={(e)=>{ if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          />
          <Button onClick={handleSend} variant="contained" disabled={loading}>
            Отправить
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
