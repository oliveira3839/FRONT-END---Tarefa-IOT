import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

// Estilo para os radio buttons
const radioStyle = {
  display: 'flex',
  alignItems: 'center',
  marginRight: '20px',
  cursor: 'pointer',
};

function AddProjectPage({ isAuthenticated }) {
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    area_saber: '',
    materia: '',
    project_link: '',
    image_url: '',
  });
  
  const [imageFile, setImageFile] = useState(null);
  
  // ESTADO: para controlar a escolha (file ou url)
  const [uploadType, setUploadType] = useState('file'); // 'file' ou 'url'
  
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  // Handler para campos de TEXTO
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProjectData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  // Handler para campo de ARQUIVO
  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
    } else {
      setImageFile(null);
    }
  };

  // Handler para os RADIO BUTTONS
  const handleUploadTypeChange = (e) => {
    setUploadType(e.target.value);
    // Limpa os campos ao trocar, para evitar confusão
    setImageFile(null);
    setProjectData(prev => ({ ...prev, image_url: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');

    if (!projectData.name || !projectData.area_saber || !projectData.materia) {
      setMessage('Nome, Área de Saber e Matéria são obrigatórios.');
      return;
    }
    
    setIsLoading(true);
    const formData = new FormData();
    
    // Adiciona os campos de texto
    formData.append('name', projectData.name);
    formData.append('description', projectData.description);
    formData.append('area_saber', projectData.area_saber);
    formData.append('materia', projectData.materia);
    formData.append('project_link', projectData.project_link);
    
    // LÓGICA CONDICIONAL: Adiciona ARQUIVO ou URL
    if (uploadType === 'file' && imageFile) {
      formData.append('image_file', imageFile); 
    } 
    else if (uploadType === 'url' && projectData.image_url) {
      formData.append('image_url', projectData.image_url);
    }

    api.post('/api/projects', formData)
      .then(response => {
        setIsLoading(false);
        setMessage('Projeto adicionado com sucesso!');
        // Limpa o formulário
        setProjectData({
          name: '',
          description: '',
          area_saber: '',
          materia: '',
          project_link: '',
          image_url: '',
        });
        setImageFile(null);
        e.target.reset(); // Limpa o input de arquivo
      })
      .catch(error => {
        setIsLoading(false);
        const errorMsg = error.response?.data?.error || 'Erro ao adicionar o projeto.';
        setMessage(errorMsg);
        console.error("Erro no POST do projeto!", error);
      });
  };
  
  if (!isAuthenticated) return null; 

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      <h1 className="page-title">Adicionar Novo Trabalho</h1>
      
      <Link to="/admin" className="back-to-admin">
        <FaArrowLeft /> Voltar ao Painel Admin
      </Link>

      <form onSubmit={handleSubmit} className="contact-form">
        
        {/* Campos de Texto (sem mudança) */}
        <div className="form-group">
          <label htmlFor="name">Nome do Projeto *</label>
          <input type="text" id="name" name="name" value={projectData.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="description">Descrição</label>
          <textarea id="description" name="description" rows="4" value={projectData.description} onChange={handleChange}></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="area_saber">Área de Saber *</label>
          <input type="text" id="area_saber" name="area_saber" value={projectData.area_saber} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="materia">Matéria *</label>
          <input type="text" id="materia" name="materia" value={projectData.materia} onChange={handleChange} required />
        </div>
        
        {/* ======================================== */}
        {/* === (UPLOAD vs URL) ===== */}
        {/* ======================================== */}
        <div className="form-group">
          <label>Imagem do Projeto</label>
          <div style={{ display: 'flex', marginBottom: '10px' }}>
            <label style={radioStyle}>
              <input 
                type="radio" 
                name="uploadType" 
                value="file" 
                checked={uploadType === 'file'} 
                onChange={handleUploadTypeChange}
              />
              <span style={{ marginLeft: '5px' }}>Fazer Upload</span>
            </label>
            <label style={radioStyle}>
              <input 
                type="radio" 
                name="uploadType" 
                value="url" 
                checked={uploadType === 'url'} 
                onChange={handleUploadTypeChange}
              />
              <span style={{ marginLeft: '5px' }}>Usar Link (URL)</span>
            </label>
          </div>

          {/* Renderização Condicional */}
          {uploadType === 'file' ? (
            <div>
              <input 
                type="file" 
                id="image_file" // Nomeado 'image_file'
                name="image_file"
                accept="image/png, image/jpeg, image/gif, image/webp"
                onChange={handleImageChange}
              />
              {imageFile && <small>Arquivo selecionado: {imageFile.name}</small>}
            </div>
          ) : (
            <div>
              <input 
                type="text" 
                id="image_url" 
                name="image_url" // Nomeado 'image_url'
                value={projectData.image_url} 
                onChange={handleChange} 
                placeholder="Ex: https://meusite.com/imagem.png" 
              />
            </div>
          )}
        </div>
        {/* ======================================== */}

        <div className="form-group">
          <label htmlFor="project_link">Link do Projeto</label>
          <input type="text" id="project_link" name="project_link" value={projectData.project_link} onChange={handleChange} placeholder="Ex: https://github.com/..." />
        </div>

        <button type="submit" className="add-button" disabled={isLoading}>
          {isLoading ? 'Enviando...' : 'Adicionar Projeto'}
        </button>
        
        {message && <p className={message.startsWith('Erro') ? 'form-message error' : 'form-message success'} style={{ textAlign: 'center', marginTop: '15px' }}>{message}</p>}
      </form>
    </div>
  );
}

export default AddProjectPage;