import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './utils/authContext';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
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

});

function AppContent() {
  const location = useLocation();
  const isChatPage = location.pathname.startsWith('/chat');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AuthProvider>
        {!isChatPage && <Navbar />}
        
        <main style={{ flex: 1 }}>
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
        </main>

        {/* {!isChatPage && <Footer />} */}
      </AuthProvider>
    </div>
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
