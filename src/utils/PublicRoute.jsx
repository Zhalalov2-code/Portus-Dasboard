import { Navigate } from 'react-router-dom';
import { useAuth } from './authContext';
import LoadingSpinner from '../components/loadingSpinner';

export default function PublicRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) return <LoadingSpinner message="Загрузка..." size={48} />;
  if (currentUser) return <Navigate to="/profil" replace />;

  return children;
}


