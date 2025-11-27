import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlus } from 'react-icons/fa';

function AddExperiencePage({ isAuthenticated }) {
  const [formData, setFormData] = useState({
    title: '', company: '', start_date: '', end_date: '', description: '',
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

    if (!formData.title || !formData.company || !formData.start_date || !formData.end_date) {
      setError('Cargo, Empresa e datas são obrigatórios.');
      return;
    }
    
    setIsLoading(true);

    api.post('/api/experiences', formData)
      .then(response => {
        setIsLoading(false);
        setMessage('Experiência adicionada com sucesso!');
        setFormData({ title: '', company: '', start_date: '', end_date: '', description: '' });
      })
      .catch(err => {
        setIsLoading(false);
        const errorMsg = err.response?.data?.error || 'Erro ao adicionar a experiência.';
        setError(errorMsg);
        console.error("Erro no POST da experiência!", err);
      });
  };
  
  if (!isAuthenticated) {
    return null; 
  }

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      <h1 className="page-title">Adicionar Experiência</h1>
      
      <Link to="/admin/curriculum" className="back-to-admin">
        <FaArrowLeft /> Voltar ao Gerenciamento do Currículo
      </Link>

      <form onSubmit={handleSubmit} className="contact-form">
        
        <div className="form-group">
          <label htmlFor="title">Cargo / Título *</label>
          <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label htmlFor="company">Empresa *</label>
          <input type="text" id="company" name="company" value={formData.company} onChange={handleChange} required />
        </div>
        
        <div className="form-group" style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
                <label htmlFor="start_date">Data de Início (Ex: Jan/2023) *</label>
                <input type="text" id="start_date" name="start_date" value={formData.start_date} onChange={handleChange} required />
            </div>
            <div style={{ flex: 1 }}>
                <label htmlFor="end_date">Data de Fim (Ex: Atual ou Dez/2023) *</label>
                <input type="text" id="end_date" name="end_date" value={formData.end_date} onChange={handleChange} required />
            </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Descrição das Atividades (Use quebras de linha para listar)</label>
          <textarea 
            id="description" 
            name="description" 
            rows="5" 
            value={formData.description} 
            onChange={handleChange}
            placeholder="Ex:&#10;- Desenvolvimento de APIs com Flask&#10;- Manutenção de código legado&#10;- Colaboração com a equipe de design"
          ></textarea>
        </div>

        <button type="submit" className="add-button" disabled={isLoading} style={{backgroundColor: '#28a745'}}>
          {isLoading ? 'Enviando...' : <><FaPlus /> Adicionar Experiência</>}
        </button>
        
        {message && <p className="form-message success" style={{ marginTop: '15px' }}>{message}</p>}
        {error && <p className="form-message error" style={{ marginTop: '15px' }}>{error}</p>}
      </form>
    </div>
  );
}

export default AddExperiencePage;