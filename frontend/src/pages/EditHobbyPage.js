import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaSave } from 'react-icons/fa';

// Estilo para os radio buttons
const radioStyle = {
  display: 'flex',
  alignItems: 'center',
  marginRight: '20px',
  cursor: 'pointer',
};

function EditHobbyPage({ isAuthenticated }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  
  const [currentImageUrl, setCurrentImageUrl] = useState(''); // Para mostrar a imagem atual
  const [imageFile, setImageFile] = useState(null);
  const [uploadType, setUploadType] = useState('url'); // 'file' ou 'url'
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const { id } = useParams();
  const navigate = useNavigate();

  // Carrega os dados do Hobby
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    api.get(`/api/hobbies/${id}`)
      .then(response => {
        const hobby = response.data;
        setFormData({
          title: hobby.title || '',
          description: hobby.description || '',
        });
        setCurrentImageUrl(hobby.image_url || '');
        
        // Define o tipo de upload baseado se já existe uma URL
        if (hobby.image_url) {
          setUploadType('url');
          setFormData(prev => ({ ...prev, image_url: hobby.image_url }));
        } else {
          setUploadType('file');
          setFormData(prev => ({ ...prev, image_url: '' }));
        }
        
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Erro ao buscar dados do hobby!", error);
        setError('Erro ao carregar o hobby. Ele existe?');
        setIsLoading(false);
      });
  }, [id, isAuthenticated, navigate]);

  // Handler para campos de TEXTO
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Handler para o ARQUIVO
  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
    } else {
      setImageFile(null);
    }
  };

  // Handler para o RÁDIO 'file' ou 'url'
  const handleUploadTypeChange = (e) => {
    setUploadType(e.target.value);
    setImageFile(null); // Limpa o arquivo se mudar
    // Limpa a URL se mudar para 'file'
    if (e.target.value === 'file') {
      setFormData(prev => ({ ...prev, image_url: '' }));
    } else {
      // Se mudar para 'url', restaura a URL atual
      setFormData(prev => ({ ...prev, image_url: currentImageUrl }));
    }
  };

  // Handler para ENVIAR
  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!formData.title || !formData.description) {
      setError('Título e Descrição são obrigatórios.');
      return;
    }
    
    setIsLoading(true);

    const putFormData = new FormData();
    putFormData.append('title', formData.title);
    putFormData.append('description', formData.description);
    
    if (uploadType === 'file' && imageFile) {
      putFormData.append('image_file', imageFile);
    } else if (uploadType === 'url') {
      putFormData.append('image_url', formData.image_url);
    }

    api.put(`/api/hobbies/${id}`, putFormData)
      .then(response => {
        setIsLoading(false);
        setMessage('Hobby atualizado com sucesso!');
        // Atualiza a imagem de preview
        setCurrentImageUrl(response.data.image_url || '');
        setImageFile(null); // Limpa o seletor de arquivo
      })
      .catch(error => {
        setIsLoading(false);
        const errorMsg = error.response?.data?.error || 'Erro ao atualizar o hobby.';
        setError(errorMsg);
        console.error("Erro no PUT do hobby!", error);
      });
  };

  if (!isAuthenticated) {
    return null;
  }
  
  if (isLoading && !formData.title) {
    return <div className="container"><h1 className="page-title">Carregando dados...</h1></div>;
  }

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      <h1 className="page-title">Editar Hobby (ID: {id})</h1>
      
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
          
          {/* Mostra a imagem atual, se existir */}
          {currentImageUrl && !imageFile && (
            <div style={{ marginBottom: '10px' }}>
              <small>Imagem atual:</small><br/>
              <img src={currentImageUrl} alt="Imagem atual" style={{ width: '100px', height: 'auto', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>
          )}

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
              <small>{imageFile ? `Substituir por: ${imageFile.name}` : 'Envie um novo arquivo para substituir.'}</small>
            </div>
          ) : (
            <div>
              <input type="text" id="image_url" name="image_url" value={formData.image_url} onChange={handleChange} placeholder="Ex: https://meusite.com/imagem.png" />
              <small>Cole a URL da imagem aqui. Deixe em branco para remover.</small>
            </div>
          )}
        </div>

        <button type="submit" className="add-button" disabled={isLoading}>
          {isLoading ? 'Salvando...' : <><FaSave /> Salvar Alterações</>}
        </button>
        
        {message && <p className="form-message success" style={{ textAlign: 'center', marginTop: '15px' }}>{message}</p>}
        {error && <p className="form-message error" style={{ textAlign: 'center', marginTop: '15px' }}>{error}</p>}
      </form>
    </div>
  );
}

export default EditHobbyPage;