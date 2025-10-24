import { Navigate } from 'react-router-dom';
import { useAuth } from './authContext';
import LoadingSpinner from '../components/loadingSpinner';

export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) return <LoadingSpinner message="Проверяем авторизацию..." size={48} />;
  if (!currentUser) return <Navigate to="/login" replace />;

  return children;
}


