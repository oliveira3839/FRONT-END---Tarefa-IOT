import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaSave } from 'react-icons/fa';

function EditEducationPage({ isAuthenticated }) {
  const [formData, setFormData] = useState({
    degree: '', institution: '', completion_date: '', details: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin');
      return;
    }
    
    setIsLoading(true);
    api.get(`/api/education/${id}`)
      .then(response => {
        const edu = response.data;
        setFormData({
          degree: edu.degree || '',
          institution: edu.institution || '',
          completion_date: edu.completion_date || '',
          details: edu.details || '',
        });
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Erro ao buscar dados da formação!", error);
        setError('Erro ao carregar a formação.');
        setIsLoading(false);
      });
  }, [id, isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!formData.degree || !formData.institution || !formData.completion_date) {
      setError('Formação, Instituição e data são obrigatórios.');
      return;
    }
    
    setIsLoading(true);

    api.put(`/api/education/${id}`, formData)
      .then(response => {
        setIsLoading(false);
        setMessage('Formação atualizada com sucesso!');
      })
      .catch(err => {
        setIsLoading(false);
        const errorMsg = err.response?.data?.error || 'Erro ao atualizar a formação.';
        setError(errorMsg);
        console.error("Erro no PUT da formação!", err);
      });
  };
  
  if (!isAuthenticated) {
    return null; 
  }

  if (isLoading && !formData.degree) {
    return <div className="container"><h1 className="page-title">Carregando dados...</h1></div>;
  }

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      <h1 className="page-title">Editar Formação (ID: {id})</h1>
      
      <Link to="/admin/curriculum" className="back-to-admin">
        <FaArrowLeft /> Voltar ao Gerenciamento do Currículo
      </Link>

      <form onSubmit={handleSubmit} className="contact-form">
        
        <div className="form-group">
          <label htmlFor="degree">Nome da Formação / Diploma *</label>
          <input type="text" id="degree" name="degree" value={formData.degree} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label htmlFor="institution">Instituição de Ensino *</label>
          <input type="text" id="institution" name="institution" value={formData.institution} onChange={handleChange} required />
        </div>
        
        <div className="form-group">
            <label htmlFor="completion_date">Data de Conclusão (Ex: Dez/2025) *</label>
            <input type="text" id="completion_date" name="completion_date" value={formData.completion_date} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label htmlFor="details">Detalhes / Destaques</label>
          <textarea 
            id="details" 
            name="details" 
            rows="4" 
            value={formData.details} 
            onChange={handleChange}
            placeholder="Ex: 5º lugar no projeto Empreenda Senac."
          ></textarea>
        </div>

        <button type="submit" className="add-button" disabled={isLoading} style={{backgroundColor: '#0077cc'}}>
          {isLoading ? 'Salvando...' : <><FaSave /> Salvar Alterações</>}
        </button>
        
        {message && <p className="form-message success" style={{ marginTop: '15px' }}>{message}</p>}
        {error && <p className="form-message error" style={{ marginTop: '15px' }}>{error}</p>}
      </form>
    </div>
  );
}

export default EditEducationPage;