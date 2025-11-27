import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaTrash } from 'react-icons/fa';

function EditExperiencePage({ isAuthenticated }) {
  const [formData, setFormData] = useState({
    title: '', company: '', start_date: '', end_date: '', description: '',
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
    api.get(`/api/experiences/${id}`)
      .then(response => {
        const exp = response.data;
        setFormData({
          title: exp.title || '',
          company: exp.company || '',
          start_date: exp.start_date || '',
          end_date: exp.end_date || '',
          description: exp.description || '',
        });
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Erro ao buscar dados da experiência!", error);
        setError('Erro ao carregar a experiência.');
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

    if (!formData.title || !formData.company || !formData.start_date || !formData.end_date) {
      setError('Cargo, Empresa e datas são obrigatórios.');
      return;
    }
    
    setIsLoading(true);

    api.put(`/api/experiences/${id}`, formData)
      .then(response => {
        setIsLoading(false);
        setMessage('Experiência atualizada com sucesso!');
      })
      .catch(err => {
        setIsLoading(false);
        const errorMsg = err.response?.data?.error || 'Erro ao atualizar a experiência.';
        setError(errorMsg);
        console.error("Erro no PUT da experiência!", err);
      });
  };

  // --- FUNÇÃO DE DELETAR ---
  const handleDelete = () => {
    const experienceName = formData.title || `ID: ${id}`;
    
    if (window.confirm(`Tem certeza que quer deletar a experiência "${experienceName}"? Esta ação não pode ser desfeita.`)) {
        setMessage('');
        setError('');
        setIsLoading(true);

        api.delete(`/api/experiences/${id}`)
            .then(() => {
                setIsLoading(false);
                setMessage("Experiência deletada com sucesso! Você será redirecionado.");
                // Redireciona de volta para a lista principal
                setTimeout(() => {
                    navigate('/admin/curriculum');
                }, 2000);
            })
            .catch(err => {
                setIsLoading(false);
                const errorMsg = err.response?.data?.error || 'Erro ao deletar a experiência.';
                setError(errorMsg);
                console.error("Erro no DELETE da experiência!", err);
            });
    }
  };
  
  if (!isAuthenticated) {
    return null; 
  }

  if (isLoading && !formData.title) {
    return <div className="container"><h1 className="page-title">Carregando dados...</h1></div>;
  }

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      <h1 className="page-title">Editar Experiência (ID: {id})</h1>
      
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
            placeholder="Ex:&#10;- Desenvolvimento de APIs com Flask&#10;- Manutenção de código legado"
          ></textarea>
        </div>

        <div className="admin-actions" style={{ display: 'flex', gap: '10px' }}>
            <button 
                type="submit" 
                className="add-button" 
                disabled={isLoading} 
                style={{ backgroundColor: '#0077cc', flex: 1 }}
            >
                {isLoading ? 'Salvando...' : <><FaSave /> Salvar Alterações</>}
            </button>
            
            <button 
                type="button" // 'type="button"' para não enviar o formulário
                className="danger-button"
                disabled={isLoading}
                onClick={handleDelete}
                style={{ flex: 1 }} // Remove o 'marginLeft' e usa 'flex'
            >
                {isLoading ? '...' : <><FaTrash /> Deletar</>}
            </button>
        </div>
        
        {message && <p className="form-message success" style={{ marginTop: '15px' }}>{message}</p>}
        {error && <p className="form-message error" style={{ marginTop: '15px' }}>{error}</p>}
      </form>
    </div>
  );
}

export default EditExperiencePage;