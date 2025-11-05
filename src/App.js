import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './utils/authContext';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Login from './pages/login';
import Register from './pages/register';
import Lkw from './pages/lkw';
import Chassi from './pages/chassi';
import Chat from './pages/chat';
import Navbar from './components/navbar';
import ProtectedRoute from './utils/ProtectedRoute';
import PublicRoute from './utils/PublicRoute';
import FahrerPage from './pages/fahrer';
import Profil from './pages/profil';

const theme = createTheme({
  // Ваши настройки темы
});

function AppContent() {
  const location = useLocation();
  
  // Определяем страницы где не нужна боковая панель
  const hideNavbarPages = ['/login', '/register'];
  const showSideNavbar = !hideNavbarPages.includes(location.pathname);

  return (
    <AuthProvider>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* Боковая панель */}
        {showSideNavbar && <Navbar />}
        
        {/* Основной контент */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            marginLeft: showSideNavbar ? '280px' : 0, // Фиксированный отступ
            minHeight: '100vh',
            backgroundColor: 'background.default',
            position: 'relative'
          }}
        >
          {/* Контейнер для страниц */}
          <Box
            sx={{
              padding: showSideNavbar ? '24px' : '0',
              maxWidth: '100%',
              height: '100%'
            }}
          >
            <Routes>
              <Route path='/' element={<ProtectedRoute><Chassi /></ProtectedRoute>} />
              <Route path='/fahrer' element={<ProtectedRoute><FahrerPage /></ProtectedRoute>} />
              <Route path='/profil' element={<ProtectedRoute><Profil /></ProtectedRoute>} />
              <Route path='/login' element={<PublicRoute><Login /></PublicRoute>} />
              <Route path='/register' element={<PublicRoute><Register /></PublicRoute>} />
              <Route path='/lkw' element={<ProtectedRoute><Lkw /></ProtectedRoute>} />
              <Route path='/chassi' element={<ProtectedRoute><Chassi /></ProtectedRoute>} />
              <Route path='/chat/:id' element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            </Routes>
          </Box>
        </Box>
      </Box>
    </AuthProvider>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
