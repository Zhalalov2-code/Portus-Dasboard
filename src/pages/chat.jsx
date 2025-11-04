/**
 * Страница чата для конкретного прицепа
 * Отображает сообщения, файлы и информацию о прицепе
 * Получает данные через API и показывает их в удобном формате
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Stack,
    Chip,
    IconButton
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import '../css/chat.css';
import axios from 'axios';

function Chat() {
    // Получаем ID прицепа из URL параметров
    const { id } = useParams();
    
    // Состояния компонента
    const [messages, setMessages] = useState([]); // Список сообщений
    const [loading, setLoading] = useState(false); // Индикатор загрузки
    const [chassiNumber, setChassiNumber] = useState(null); // Номер прицепа
    
    // API endpoints
    const URL_MESSAGES = `http://localhost/portusApp1/message_chassi`; // Сообщения
    const URL_FILES = `http://localhost/portusApp1/files_chassi`; // Файлы
    const URL_CHASSI = `http://localhost/portusApp1/chassi`; // Данные прицепов
    
    const navigate = useNavigate();

    /**
     * Получение всех сообщений для текущего прицепа
     * Для каждого сообщения также загружает прикрепленные файлы
     */
    const getMessages = useCallback(async () => {
        try {
            setLoading(true);
            
            // Получаем сообщения по ID прицепа
            const responseMessage = await axios({
                method: 'GET',
                url: URL_MESSAGES,
                params: { id_chassi: id }
            })
            
            if (responseMessage.status === 200) {
                let messageData;
                
                // Обрабатываем различные структуры ответа API
                if (Array.isArray(responseMessage.data)) {
                    messageData = responseMessage.data;
                } else if (responseMessage.data && Array.isArray(responseMessage.data.messages)) {
                    messageData = responseMessage.data.messages;
                } else if (responseMessage.data && Array.isArray(responseMessage.data.data)) {
                    messageData = responseMessage.data.data;
                } else {
                    console.error('Неожиданная структура данных:', responseMessage.data);
                    setMessages([]);
                    return;
                }
                
                // Если сообщений нет
                if (messageData.length === 0) {
                    setMessages([]);
                    return;
                }
                
                // Для каждого сообщения получаем прикрепленные файлы
                const messageWithFiles = await Promise.all(
                    messageData.map(async (message) => {
                        try {
                            const responseFiles = await axios({
                                method: 'GET',
                                url: URL_FILES,
                                params: { id_message: message.id_message }
                            })
                            
                            let filesData = [];
                            
                            // Обрабатываем структуру ответа для файлов
                            if (responseFiles.status === 200 && responseFiles.data) {
                                if (Array.isArray(responseFiles.data)) {
                                    filesData = responseFiles.data;
                                } else if (responseFiles.data.data && Array.isArray(responseFiles.data.data)) {
                                    filesData = responseFiles.data.data;
                                } else if (responseFiles.data.files && Array.isArray(responseFiles.data.files)) {
                                    filesData = responseFiles.data.files;
                                }
                            }
                            
                            // Возвращаем сообщение с прикрепленными файлами
                            return { 
                                ...message, 
                                files: filesData
                            };
                        } catch (error) {
                            // При ошибке загрузки файлов возвращаем сообщение без файлов
                            return { ...message, files: [] };
                        }
                    })
                )
                
                setMessages(messageWithFiles);
            }
        } catch (error) {
            console.error('Ошибка при получении сообщений:', error);
            setMessages([]);
        } finally {
            setLoading(false);
        }
    }, [id, URL_MESSAGES, URL_FILES]);

    /**
     * Получение номера прицепа по ID
     * Загружает все прицепы и ищет нужный по ID
     * @param {Function} callback - функция для выполнения после получения данных
     */
    const getChassiNumber = useCallback(async (callback) => {
        try {
            // Получаем список всех прицепов
            const response = await axios({
                method: 'GET',
                url: URL_CHASSI
            });
            
            if (response.status === 200) {
                let chassiList = [];
                
                // Извлекаем массив прицепов из ответа
                if (Array.isArray(response.data)) {
                    chassiList = response.data;
                } else if (response.data?.data && Array.isArray(response.data.data)) {
                    chassiList = response.data.data;
                }
                
                // Ищем прицеп с нужным ID
                const foundChassi = chassiList.find(chassi => chassi.id_chassi === parseInt(id));
                
                if (foundChassi) {
                    setChassiNumber(foundChassi.chassi_nummer);
                    console.log('✅ Найден прицеп:', foundChassi.chassi_nummer);
                } else {
                    console.log('❌ Прицеп с ID', id, 'не найден');
                }
                
                // Выполняем callback функцию после получения данных
                if (callback) callback();
            }
        } catch (error) {
            console.error('Ошибка при получении списка шасси:', error);
            // Выполняем callback даже при ошибке
            if (callback) callback();
        }
    }, [id, URL_CHASSI]);

    // Эффект для загрузки данных при монтировании компонента
    useEffect(() => {
        if(id){
            // Сначала получаем номер прицепа, затем сообщения
            getChassiNumber(() => {
                getMessages();
            });
        }
    }, [id, getChassiNumber, getMessages]);

    /**
     * Форматирование даты для отображения
     * @param {string} dateString - строка с датой
     * @returns {string} - отформатированная дата
     */
    const formatDate = (dateString) => {
        if (!dateString) return 'Дата не указана';
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'Неверная дата';
        }
        
        return date.toLocaleString('ru-RU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    /**
     * Возврат на предыдущую страницу
     */
    const handleBack = () => {
        navigate(-1);
    }

    return (
        <Container maxWidth="md" className="chat-container">
            {/* Кнопка возврата */}
            <button className='back-button' onClick={handleBack}>Назад</button>
            
            <Paper elevation={3} className="chat-paper">
                {/* Заголовок чата с информацией о прицепе */}
                <Box className="chat-header">
                    <Box className="chat-header-info">
                        <Box className="header-text">
                            <Typography variant="h6" className="header-title">
                                Прицеп {chassiNumber || `№${id}`}
                            </Typography>
                            <Typography variant="caption" className="header-status">
                                {loading ? 'Загрузка...' : `Всего сообщений: ${messages.length}`}
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton className="header-menu">
                        <MoreVertIcon />
                    </IconButton>
                </Box>

                {/* Область отображения сообщений */}
                <Box className="messages-area messages-scroll">
                    <Stack spacing={2} className="messages-stack">
                        {loading ? (
                            // Индикатор загрузки
                            <Box className="message-container">
                                <Typography>Загрузка сообщений...</Typography>
                            </Box>
                        ) : messages.length === 0 ? (
                            // Сообщение об отсутствии данных
                            <Box className="message-container">
                                <Typography>Нет сообщений</Typography>
                            </Box>
                        ) : (
                            // Список сообщений
                            messages.map((message) => (
                                <Box 
                                    key={message.id_message} 
                                    className="message-container"
                                >
                                    <Box className="message-bubble">
                                        <Box className="message-content">
                                            {/* Заголовок сообщения с отправителем и временем */}
                                            <Box className="message-header">
                                                <Chip 
                                                    label={message.type_sender} 
                                                    size="small" 
                                                    color="primary" 
                                                    className="sender-chip" 
                                                />
                                                <Typography variant="caption" className="message-time">
                                                    {formatDate(message.created_ad)}
                                                </Typography>
                                            </Box>
                                            
                                            {/* Текст сообщения */}
                                            {message.text && (
                                                <Typography className="message-text">
                                                    {message.text}
                                                </Typography>
                                            )}
                                            
                                            {/* Прикрепленные файлы (изображения) */}
                                            {message.files && Array.isArray(message.files) && message.files.length > 0 && (
                                                <Box className="message-files" sx={{ mt: 1 }}>
                                                    {message.files.map((file, index) => (
                                                        <Box key={index} className="file-preview" sx={{ mb: 1 }}>
                                                            <img 
                                                                src={`http://localhost/portusApp1/uploads/${file.file_name}`}
                                                                alt={file.file_name || 'Изображение'}
                                                                style={{ 
                                                                    maxWidth: 400, 
                                                                    maxHeight: 200, 
                                                                    borderRadius: 8,
                                                                    cursor: 'pointer'
                                                                }}
                                                                onClick={() => window.open(`http://localhost/portusApp1/uploads/${file.file_name}`, '_blank')}
                                                                onError={(e) => {
                                                                    // При ошибке загрузки показываем placeholder
                                                                    e.target.style.display = 'none';
                                                                    e.target.nextSibling.style.display = 'block';
                                                                }}
                                                            />
                                                            <Typography 
                                                                className="file-placeholder" 
                                                                style={{ display: 'none' }}
                                                            >
                                                                📷 {file.file_name || 'Изображение недоступно'}
                                                            </Typography>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>
                                </Box>
                            ))
                        )}
                    </Stack>
                </Box>
            </Paper>
        </Container>
    );
}

export default Chat;