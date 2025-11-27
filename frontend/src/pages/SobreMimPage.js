import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig'; // Importa o axios configurado

// Texto de fallback caso o banco esteja vazio (DO V1)
const DEFAULT_INTRO = "Adicone sua introdução informal no painel administrativo.";

function SobreMimPage() {
  // 1. Estados para hobbies, introdução e loading (DO V1)
  const [hobbies, setHobbies] = useState([]);
  const [introText, setIntroText] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // 2. Buscar TODOS os dados da API (DO V1)
  useEffect(() => {
    setIsLoading(true);
    
    const fetchHobbies = api.get('/api/hobbies');
    const fetchIntro = api.get('/api/general-info'); // Busca os dados gerais

    Promise.all([fetchHobbies, fetchIntro])
      .then(([hobbiesResponse, introResponse]) => {
        setHobbies(hobbiesResponse.data);
        // Define o texto do banco ou usa o fallback se estiver vazio
        setIntroText(introResponse.data.informal_intro || DEFAULT_INTRO); 
      })
      .catch(error => {
        console.error("Erro ao buscar dados da página:", error);
        // Mesmo com erro, define o fallback para a página não quebrar
        setIntroText(DEFAULT_INTRO); 
      })
      .finally(() => {
        setIsLoading(false);
      });

  }, []); // O array vazio [] garante que isso rode só uma vez

  // Função para pegar as iniciais (placeholder)
  const getInitials = (name) => {
    if (!name) return '?';
    const words = name.split(' ');
    if (words.length > 1) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="container">
      <h2 className="page-title">Um Pouco Mais Sobre Mim</h2>

      {/* --- INTRODUÇÃO DINÂMICA --- */}
      <div className="informal-intro">
        {isLoading ? (
          <p>Carregando introdução...</p>
        ) : (
          // Usar whiteSpace: 'pre-line' para respeitar as quebras de linha
          <p style={{ whiteSpace: 'pre-line' }}>
            {introText}
          </p>
        )}
      </div>

      {/* --- SEÇÃO DE HOBBIES --- */}
      <div className="hobbies-container">
        {isLoading ? (
          <p style={{textAlign: 'center', fontStyle: 'italic', fontSize: '1.1rem'}}>Carregando hobbies...</p>
        ) : hobbies.length === 0 ? (
          // Mensagem de placeholder
          <div className="informal-intro" style={{backgroundColor: '#ffffffff'}}>
            <p style={{margin: 0, color: '#555555'}}>Cadastre seus hobbies no painel administrativo.</p>
          </div>
        ) : (
          hobbies.map((hobby) => (
            <div key={hobby.id} className="hobby-card">
              {/* Usar a imagem da API, com um placeholder se não houver */}
              {hobby.image_url ? (
                <img src={hobby.image_url} alt={hobby.title} className="hobby-image" />
              ) : (
                <div className="hobby-image" style={{
                    height: '300px',
                    flexShrink: 0,
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    backgroundColor: '#e9ecef', 
                    color: '#adb5bd'
                  }}>
                  <span style={{fontSize: '2.5rem', fontWeight: 'bold'}}>{getInitials(hobby.title)}</span>
                </div>
              )}
              
              <div className="hobby-content">
                <h3>{hobby.title}</h3>
                <p>{hobby.description}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default SobreMimPage;