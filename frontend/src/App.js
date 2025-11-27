import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import SobreMimPage from './pages/SobreMimPage';
import CurriculumPage from './pages/CurriculumPage';
import RankingPage from './pages/RankingPage';
import ContactPage from './pages/ContactPage';
import AdminPage from './pages/AdminPage';
import AddProjectPage from './pages/AddProjectPage';
import EditProjectPage from './pages/EditProjectPage';
import EditHobbyPage from './pages/EditHobbyPage'; 
import AddHobbyPage from './pages/AddHobbyPage'; 
import CurriculumAdminPage from './pages/CurriculumAdminPage';
import AddExperiencePage from './pages/AddExperiencePage';
import EditExperiencePage from './pages/EditExperiencePage';
import AddEducationPage from './pages/AddEducationPage';
import EditEducationPage from './pages/EditEducationPage';
import AddSkillPage from './pages/AddSkillPage';
import EditSkillPage from './pages/EditSkillPage';

import AddAdditionalInfoPage from './pages/AddAdditionalInfoPage';
import EditAdditionalInfoPage from './pages/EditAdditionalInfoPage'; 

import './App.css';

// Componente helper para o Logout
function LogoutHandler({ handleLogout }) {
    const navigate = useNavigate();
    useEffect(() => {
        handleLogout();
        navigate('/'); // Redireciona para a Home após o logout
    }, [handleLogout, navigate]);
    return null;
}

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState(localStorage.getItem('admin_token'));

    // useEffect de verificação de token
    useEffect(() => {
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                if (decodedToken.exp * 1000 > Date.now()) {
                    setIsAuthenticated(true);
                } else {
                    localStorage.removeItem('admin_token');
                    setToken(null);
                    setIsAuthenticated(false);
                }
            } catch (error) {
                localStorage.removeItem('admin_token');
                setToken(null);
                setIsAuthenticated(false);
            }
        } else {
            setIsAuthenticated(false);
        }
    }, [token]);

    // handleLogin e handleLogout
    const handleLogin = (newToken) => {
        localStorage.setItem('admin_token', newToken);
        setToken(newToken);
        setIsAuthenticated(true);
    };
    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        setToken(null);
        setIsAuthenticated(false);
    };

    return (
        <Router>
            <div className="app-container">
                <Header isAuthenticated={isAuthenticated} onLogout={handleLogout} />
                
                <main className="main-content-flex-grow">
                    <Routes>
                        {/* Rotas Públicas */}
                        <Route path="/" element={<HomePage isAuthenticated={isAuthenticated} />} />
                        <Route path="/sobremim" element={<SobreMimPage />} />
                        <Route path="/curriculo" element={<CurriculumPage />} />
                        <Route path="/ranking" element={<RankingPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        
                        {/* Rota de Admin */}
                        <Route 
                            path="/admin" 
                            element={<AdminPage 
                                isAuthenticated={isAuthenticated} 
                                onLogin={handleLogin} 
                                onLogout={handleLogout}
                            />} 
                        />
                        
                        {/* ================================== */}
                        {/* === ROTAS CRUD PROTEGIDAS === */}
                        {/* ================================== */}

                        {/* Admin Hub de Currículo */}
                        <Route 
                            path="/admin/curriculum" 
                            element={<CurriculumAdminPage isAuthenticated={isAuthenticated} />} 
                        />
                        
                        {/* Projetos e Hobbies */}
                        <Route path="/admin/add-project" element={<AddProjectPage isAuthenticated={isAuthenticated} />} />
                        <Route path="/admin/edit-project/:id" element={<EditProjectPage isAuthenticated={isAuthenticated} />} />
                        <Route path="/admin/edit-hobby/:id" element={<EditHobbyPage isAuthenticated={isAuthenticated} />} />
                        <Route path="/admin/add-hobby" element={<AddHobbyPage isAuthenticated={isAuthenticated} />} />

                        {/* Experiência */}
                        <Route path="/admin/curriculum/add-experience" element={<AddExperiencePage isAuthenticated={isAuthenticated} />} />
                        <Route path="/admin/curriculum/edit-experience/:id" element={<EditExperiencePage isAuthenticated={isAuthenticated} />} />
                        
                        {/* Formação */}
                        <Route path="/admin/curriculum/add-education" element={<AddEducationPage isAuthenticated={isAuthenticated} />} />
                        <Route path="/admin/curriculum/edit-education/:id" element={<EditEducationPage isAuthenticated={isAuthenticated} />} />
                        
                        {/* Habilidades */}
                        <Route path="/admin/curriculum/add-skill" element={<AddSkillPage isAuthenticated={isAuthenticated} />} />
                        <Route path="/admin/curriculum/edit-skill/:id" element={<EditSkillPage isAuthenticated={isAuthenticated} />} />
                        
                        {/* === ROTAS DE INFORMAÇÕES ADICIONAIS === */}
                        <Route path="/admin/curriculum/add-additional-info" element={<AddAdditionalInfoPage isAuthenticated={isAuthenticated} />} />
                        <Route path="/admin/curriculum/edit-additional-info/:id" element={<EditAdditionalInfoPage isAuthenticated={isAuthenticated} />} />
                        {/* ============================================== */}


                        {/* Rota de Logout */}
                        <Route path="/logout" element={<LogoutHandler handleLogout={handleLogout} />} />

                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    );
}

export default App;