import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlus } from 'react-icons/fa';

// Estilo para os radio buttons
const radioStyle = {
  display: 'flex',
  alignItems: 'center',
  marginRight: '20px',
  cursor: 'pointer',
};

function AddHobbyPage({ isAuthenticated }) {
  // --- Estados para o formulário de Hobby ---
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [uploadType, setUploadType] = useState('file');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
    } else {
      setImageFile(null);
    }
  };

  const handleUploadTypeChange = (e) => {
    setUploadType(e.target.value);
    setImageFile(null);
    setFormData(prev => ({ ...prev, image_url: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!formData.title || !formData.description) {
      setError('Título e Descrição são obrigatórios.');
      return;
    }
    
    setIsLoading(true);
    const postFormData = new FormData();
    
    postFormData.append('title', formData.title);
    postFormData.append('description', formData.description);
    
    if (uploadType === 'file' && imageFile) {
      postFormData.append('image_file', imageFile); 
    } 
    else if (uploadType === 'url' && formData.image_url) {
      postFormData.append('image_url', formData.image_url);
    }

    api.post('/api/hobbies', postFormData)
      .then(response => {
        setIsLoading(false);
        setMessage('Hobby adicionado com sucesso!');
        setFormData({ title: '', description: '', image_url: '' });
        setImageFile(null);
        e.target.reset(); // Limpa o formulário
      })
      .catch(error => {
        setIsLoading(false);
        const errorMsg = error.response?.data?.error || 'Erro ao adicionar o hobby.';
        setError(errorMsg);
        console.error("Erro no POST do hobby!", error);
      });
  };
  
  if (!isAuthenticated) {
    return null; 
  }

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      <h1 className="page-title">Adicionar Novo Hobby</h1>
      
      <Link to="/admin" className="back-to-admin">
        <FaArrowLeft /> Voltar ao Painel Admin
      </Link>

      <form onSubmit={handleSubmit} className="contact-form">
        
        <div className="form-group">
          <label htmlFor="title">Título *</label>
          <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label htmlFor="description">Descrição *</label>
          <textarea id="description" name="description" rows="4" value={formData.description} onChange={handleChange} required></textarea>
        </div>
        
        <div className="form-group">
          <label>Imagem do Hobby</label>
          <div style={{ display: 'flex', marginBottom: '10px' }}>
            <label style={radioStyle}>
              <input type="radio" name="uploadType" value="file" checked={uploadType === 'file'} onChange={handleUploadTypeChange} />
              <span style={{ marginLeft: '5px' }}>Fazer Upload</span>
            </label>
            <label style={radioStyle}>
              <input type="radio" name="uploadType" value="url" checked={uploadType === 'url'} onChange={handleUploadTypeChange} />
              <span style={{ marginLeft: '5px' }}>Usar Link (URL)</span>
            </label>
          </div>
          
          {uploadType === 'file' ? (
            <div>
              <input type="file" id="image_file" name="image_file" accept="image/png, image/jpeg, image/gif, image/webp" onChange={handleImageChange} />
              {imageFile && <small>Selecionado: {imageFile.name}</small>}
            </div>
          ) : (
            <div>
              <input type="text" id="image_url" name="image_url" value={formData.image_url} onChange={handleChange} placeholder="Ex: https://meusite.com/imagem.png" />
            </div>
          )}
        </div>

        <button type="submit" className="add-button" disabled={isLoading} style={{backgroundColor: '#5bc0de', color: 'white'}}>
          {isLoading ? 'Enviando...' : <><FaPlus /> Adicionar Hobby</>}
        </button>
        
        {message && <p className="form-message success" style={{ marginTop: '15px' }}>{message}</p>}
        {error && <p className="form-message error" style={{ marginTop: '15px' }}>{error}</p>}
      </form>
    </div>
  );
}

export default AddHobbyPage;