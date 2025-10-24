import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import ChassiPage from './pages/chassi';
import Login from './pages/login';
import Register from './pages/register';
import Profile from './pages/profil';
import FahrerPage from './pages/fahrer';
import Navbar from './components/navbar';
import Footer from './components/footer';
import ProtectedRoute from './utils/ProtectedRoute';
import PublicRoute from './utils/PublicRoute';
import Lkw from './pages/lkw';

function App() {
    return (
        <Router>
            <div className="App">
                <Navbar/>
                <main>
                    <Routes>
                        <Route path='/' element={<ProtectedRoute><Profile/></ProtectedRoute>}/>
                        <Route path='/profil' element={<ProtectedRoute><Profile/></ProtectedRoute>}/>
                        <Route path='/fahrer' element={<ProtectedRoute><FahrerPage/></ProtectedRoute>}/>
                        <Route path='/chassi' element={<ProtectedRoute><ChassiPage/></ProtectedRoute>}/>
                        <Route path='/login' element={<PublicRoute><Login/></PublicRoute>}/>
                        <Route path='/register' element={<PublicRoute><Register/></PublicRoute>}/>
                        <Route path='/lkw' element={<ProtectedRoute><Lkw/></ProtectedRoute>}/>
                    </Routes>
                </main>
                <Footer/>
            </div>
        </Router>
    );
}

export default App;
