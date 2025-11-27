import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlus } from 'react-icons/fa';

function AddSkillPage({ isAuthenticated }) {
  const [formData, setFormData] = useState({
    name: '', category: 'Técnica',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!formData.name) {
      setError('O nome da habilidade é obrigatório.');
      return;
    }
    
    setIsLoading(true);

    api.post('/api/skills', formData)
      .then(response => {
        setIsLoading(false);
        setMessage(`Habilidade '${formData.name}' adicionada com sucesso!`);
        setFormData({ name: '', category: formData.category }); // Mantém a categoria anterior
      })
      .catch(err => {
        setIsLoading(false);
        const errorMsg = err.response?.data?.error || 'Erro ao adicionar a habilidade.';
        setError(errorMsg);
        console.error("Erro no POST da habilidade!", err);
      });
  };
  
  if (!isAuthenticated) {
    return null; 
  }

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      <h1 className="page-title">Adicionar Habilidade (Skill)</h1>
      
      <Link to="/admin/curriculum" className="back-to-admin">
        <FaArrowLeft /> Voltar ao Gerenciamento do Currículo
      </Link>

      <form onSubmit={handleSubmit} className="contact-form">
        
        <div className="form-group">
          <label htmlFor="name">Nome da Habilidade *</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label htmlFor="category">Categoria</label>
          <select id="category" name="category" value={formData.category} onChange={handleChange}>
            <option value="Técnica">Técnica</option>
            <option value="Soft Skill">Soft Skill</option>
            <option value="Idioma">Idioma</option>
            <option value="Outras">Outras</option>
          </select>
        </div>

        <button type="submit" className="add-button" disabled={isLoading} style={{backgroundColor: '#28a745'}}>
          {isLoading ? 'Enviando...' : <><FaPlus /> Adicionar Habilidade</>}
        </button>
        
        {message && <p className="form-message success" style={{ marginTop: '15px' }}>{message}</p>}
        {error && <p className="form-message error" style={{ marginTop: '15px' }}>{error}</p>}
      </form>
    </div>
  );
}

export default AddSkillPage;