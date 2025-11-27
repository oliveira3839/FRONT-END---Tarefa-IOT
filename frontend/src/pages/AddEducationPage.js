import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlus, FaSave } from 'react-icons/fa'; // Importe o FaSave

function AddEducationPage({ isAuthenticated }) {
    const navigate = useNavigate();
    
    // Atualizar o estado ---
    const [formData, setFormData] = useState({
        degree: '',
        institution: '',
        start_date: '',
        end_date: '',
        details: '',
    });

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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

        // Validar os campos novos ---
        const { degree, institution, start_date, end_date } = formData;
        if (!degree || !institution || !start_date || !end_date) {
            setError('Todos os campos com * são obrigatórios.');
            return;
        }
        
        setIsLoading(true);

        api.post('/api/education', formData)
            .then(() => {
                setIsLoading(false);
                setMessage('Formação adicionada com sucesso!');
                // Limpa o formulário corretamente
                setFormData({ degree: '', institution: '', start_date: '', end_date: '', details: '' }); 
                
                setTimeout(() => {
                    navigate('/admin/curriculum');
                }, 1500);
            })
            .catch(err => {
                setIsLoading(false);
                const errorMsg = err.response?.data?.error || 'Erro ao adicionar a formação.';
                setError(errorMsg);
                console.error("Erro no POST da formação!", err);
            });
    };
    
    if (!isAuthenticated) {
        return null; 
    }

    return (
        <div className="container" style={{ maxWidth: '600px' }}>
            <h1 className="page-title">Adicionar Formação</h1>
            
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
                
                {/* ---Atualizar o Formulário --- */}
                <div className="form-group" style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ flex: 1 }}>
                        <label htmlFor="start_date">Data de Início (Ex: Jan/2023) *</label>
                        <input type="text" id="start_date" name="start_date" value={formData.start_date} onChange={handleChange} required />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label htmlFor="end_date">Data de Fim (Ex: Atual ou Dez/2025) *</label>
                        <input type="text" id="end_date" name="end_date" value={formData.end_date} onChange={handleChange} required />
                    </div>
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
                        style={{resize: 'vertical'}}
                    ></textarea>
                </div>

                <button type="submit" className="add-button" disabled={isLoading} style={{backgroundColor: '#28a745'}}>
                    {isLoading ? 'Enviando...' : <><FaPlus /> Adicionar Formação</>}
                </button>
                
                {message && <p className="form-message success" style={{ marginTop: '15px' }}>{message}</p>}
                {error && <p className="form-message error" style={{ marginTop: '15px' }}>{error}</p>}
            </form>
        </div>
    );
}

export default AddEducationPage;