import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaTrash } from 'react-icons/fa';

function EditSkillPage({ isAuthenticated }) {
  const [formData, setFormData] = useState({
    name: '', category: '',
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
    api.get(`/api/skills/${id}`)
      .then(response => {
        const skill = response.data;
        setFormData({
          name: skill.name || '',
          category: skill.category || 'Técnica',
        });
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Erro ao buscar dados da habilidade!", error);
        setError('Erro ao carregar a habilidade.');
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

    if (!formData.name) {
      setError('O nome da habilidade é obrigatório.');
      return;
    }
    
    setIsLoading(true);

    api.put(`/api/skills/${id}`, formData)
      .then(response => {
        setIsLoading(false);
        setMessage(`Habilidade '${formData.name}' atualizada com sucesso!`);
      })
      .catch(err => {
        setIsLoading(false);
        const errorMsg = err.response?.data?.error || 'Erro ao atualizar a habilidade.';
        setError(errorMsg);
        console.error("Erro no PUT da habilidade!", err);
      });
  };

  // --- FUNÇÃO DE DELETAR ---
  const handleDelete = () => {
    const skillName = formData.name || `ID: ${id}`;
    
    if (window.confirm(`Tem certeza que quer deletar a habilidade "${skillName}"?`)) {
        setMessage('');
        setError('');
        setIsLoading(true);

        api.delete(`/api/skills/${id}`)
            .then(() => {
                setIsLoading(false);
                setMessage("Habilidade deletada com sucesso! Você será redirecionado.");
                // Redireciona de volta para a lista principal
                setTimeout(() => {
                    navigate('/admin/curriculum');
                }, 2000);
            })
            .catch(err => {
                setIsLoading(false);
                const errorMsg = err.response?.data?.error || 'Erro ao deletar a habilidade.';
                setError(errorMsg);
                console.error("Erro no DELETE da habilidade!", err);
            });
    }
  };
  
  if (!isAuthenticated) {
    return null; 
  }

  if (isLoading && !formData.name) {
    return <div className="container"><h1 className="page-title">Carregando dados...</h1></div>;
  }

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      <h1 className="page-title">Editar Habilidade (ID: {id})</h1>
      
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
                type="button" // Importante: 'type="button"' para não enviar o formulário
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

export default EditSkillPage;