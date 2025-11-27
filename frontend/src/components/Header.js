import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import api from '../api/axiosConfig';

function Header({ isAuthenticated, onLogout }) {
  const [menuActive, setMenuActive] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const navigate = useNavigate();
  
  // Recupera o nome salvo no localStorage durante o Login
  const userName = localStorage.getItem('admin_username'); 

  // Busca a imagem de perfil definida na Home/Admin
  useEffect(() => {
    if (isAuthenticated) {
      api.get('/api/general-info')
        .then(response => {
          if (response.data && response.data.profile_pic_url) {
            setProfileImage(response.data.profile_pic_url);
          }
        })
        .catch(error => console.error("Erro ao carregar imagem do header:", error));
    }
  }, [isAuthenticated]);

  const handleLogoutClick = () => {
    localStorage.removeItem('admin_username'); // Limpa o nome
    onLogout();
    navigate('/admin'); 
  };

  return (
    <header className="app-header">
      <Link to="/" className="header-logo" onClick={() => setMenuActive(false)}>
        <img src="/logo.png" alt="Portfólio" className="logo-img" />
      </Link>
      
      <div className="hamburger" onClick={() => setMenuActive(!menuActive)}>
        &#9776;
      </div>

      <nav className={menuActive ? "nav-menu active" : "nav-menu"}>
        <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setMenuActive(false)}>
          Home
        </NavLink>
        <NavLink to="/sobremim" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setMenuActive(false)}>
          Sobre Mim
        </NavLink>
        <NavLink to="/curriculo" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setMenuActive(false)}>
          Currículo
        </NavLink>
        <NavLink to="/ranking" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setMenuActive(false)}>
          Ranking
        </NavLink>
        <NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setMenuActive(false)}>
          Contato
        </NavLink>
        <NavLink to="/admin" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setMenuActive(false)}>
          Painel Admin
        </NavLink>

        {isAuthenticated && (
          <div className="user-controls">
            <div className="user-info">
                {/* Lógica: Se tiver imagem, mostra ela. Se não, mostra o ícone padrão */}
                {profileImage ? (
                    <img src={profileImage} alt="Perfil" className="header-profile-img" />
                ) : (
                    <FaUserCircle className="header-default-icon" />
                )}
                
                {/* Mostra o nome ou "Admin" se der erro no localStorage */}
                <span className="user-name">Olá, {userName || 'Admin'}</span>
            </div>

            <button onClick={handleLogoutClick} className="logout-button">
              <FaSignOutAlt /> Sair
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Header;