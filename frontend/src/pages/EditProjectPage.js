import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

// Estilo para os radio buttons
const radioStyle = {
  display: 'flex',
  alignItems: 'center',
  marginRight: '20px',
  cursor: 'pointer',
};

function EditProjectPage({ isAuthenticated }) {
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    area_saber: '',
    materia: '',
    project_link: '',
    image_url: '', //
  });
  
  const [currentImageUrl, setCurrentImageUrl] = useState(''); 
  const [imageFile, setImageFile] = useState(null);
  
  // NOVO ESTADO: para controlar a escolha (file ou url)
  const [uploadType, setUploadType] = useState('file'); // 'file' ou 'url'
  
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin');
      return;
    }
    
    setIsLoading(true);
    // Usar a rota protegida para pegar o projeto por ID
    api.get(`/api/projects/${id}`) 
      .then(response => {
        const project = response.data;
        setProjectData({
          name: project.name || '',
          description: project.description || '',
          area_saber: project.area_saber || '',
          materia: project.materia || '',
          project_link: project.project_link || '',
          image_url: project.image_url || '', // <-- Carrega a URL existente
        });
        setCurrentImageUrl(project.image_url || '');
        
        // Define o radio button com base se já existe uma URL
        if (project.image_url) {
          setUploadType('url');
        } else {
          setUploadType('file');
        }
        
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Erro ao buscar dados do projeto!", error);
        setMessage('Erro ao carregar o projeto. Ele existe?');
        setIsLoading(false);
      });
  }, [id, isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProjectData(prevData => ({
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
  
  // Handler para os RADIO BUTTONS
  const handleUploadTypeChange = (e) => {
    setUploadType(e.target.value);
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
    
    formData.append('name', projectData.name);
    formData.append('description', projectData.description);
    formData.append('area_saber', projectData.area_saber);
    formData.append('materia', projectData.materia);
    formData.append('project_link', projectData.project_link);
    
    // LÓGICA CONDICIONAL: Adiciona ARQUIVO ou URL
    if (uploadType === 'file' && imageFile) {
      formData.append('image_file', imageFile);
    } 
    else if (uploadType === 'url') {
      // Envia a URL (mesmo se estiver vazia, para apagar a imagem)
      formData.append('image_url', projectData.image_url);
    }
    // Se 'file' for escolhido mas nenhum arquivo for selecionado,
    // o backend manterá a imagem antiga.

    api.put(`/api/projects/${id}`, formData)
      .then(response => {
        setIsLoading(false);
        setMessage('Projeto atualizado com sucesso!');
        setCurrentImageUrl(response.data.image_url || '');
        setProjectData(prev => ({...prev, image_url: response.data.image_url || ''}));
        setImageFile(null);
      })
      .catch(error => {
        setIsLoading(false);
        const errorMsg = error.response?.data?.error || 'Erro ao atualizar o projeto.';
        setMessage(errorMsg);
        console.error("Erro no PUT do projeto!", error);
      });
  };

  if (!isAuthenticated) return null;
  if (isLoading && !projectData.name) {
    return <div className="container"><h1 className="page-title">Carregando dados...</h1></div>;
  }

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      <h1 className="page-title">Editar Trabalho (ID: {id})</h1>
      
      <Link to="/admin" className="back-to-admin">
        <FaArrowLeft /> Voltar ao Painel Admin
      </Link>

      <form onSubmit={handleSubmit} className="contact-form">
        
        {/* ... (campos de texto: name, description, area_saber, materia) ... */}
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
        {/* === SELEÇÃO (UPLOAD vs URL) ===== */}
        {/* ======================================== */}
        <div className="form-group">
          <label>Imagem do Projeto</label>
          
          {/* Mostra a imagem atual, se existir */}
          {currentImageUrl && (
            <div style={{ marginBottom: '10px' }}>
              <small>Imagem atual:</small><br/>
              <img src={currentImageUrl} alt="Imagem atual" style={{ width: '100px', height: 'auto', border: '1px solid #ccc' }} />
            </div>
          )}

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
                id="image_file" 
                name="image_file"
                accept="image/png, image/jpeg, image/gif, image/webp"
                onChange={handleImageChange}
              />
              <small>{imageFile ? `Substituir por: ${imageFile.name}` : 'Envie um novo arquivo para substituir a imagem.'}</small>
            </div>
          ) : (
            <div>
              <input 
                type="text" 
                id="image_url" 
                name="image_url"
                value={projectData.image_url} // O valor agora é controlado
                onChange={handleChange} 
                placeholder="Cole a URL da imagem aqui (ou deixe em branco para remover)" 
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
          {isLoading ? 'Enviando...' : 'Salvar Alterações'}
        </button>
        
        {message && <p className={message.startsWith('Erro') ? 'form-message error' : 'form-message success'} style={{ textAlign: 'center', marginTop: '15px' }}>{message}</p>}
      </form>
    </div>
  );
}

export default EditProjectPage;