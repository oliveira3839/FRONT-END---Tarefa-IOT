import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { FaArrowLeft, FaSave, FaPlus } from 'react-icons/fa';

function AddAdditionalInfoPage() {
    const navigate = useNavigate();
    const [text, setText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setIsLoading(true);

        if (!text.trim()) {
            setError('O campo de texto é obrigatório.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await api.post('/api/additional-info', { text });
            setMessage('Item adicionado com sucesso!');
            setTimeout(() => {
                navigate('/admin/curriculum');
            }, 1000);
        } catch (err) {
            console.error("Erro ao adicionar item:", err.response || err);
            setError(err.response?.data?.error || 'Erro ao adicionar a informação adicional.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container">
            <h1 className="page-title">Adicionar Informação Adicional</h1>
            
            <Link to="/admin/curriculum" className="back-to-admin">
                <FaArrowLeft /> Voltar ao Painel do Currículo
            </Link>
            
            <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                    <label htmlFor="text">Texto da Informação</label>
                    <textarea 
                        id="text" 
                        rows="4" 
                        value={text} 
                        onChange={(e) => setText(e.target.value)} 
                        placeholder="Ex: Disponibilidade para aprender, colaborar e crescer dentro da empresa."
                        required 
                        style={{resize: 'vertical'}}
                    />
                </div>

                <button type="submit" disabled={isLoading} className="add-button">
                    {isLoading ? 'Salvando...' : <><FaPlus /> Adicionar Item</>}
                </button>
                
                {error && <p className="form-message error">{error}</p>}
                {message && <p className="form-message success">{message}</p>}
            </form>
        </div>
    );
}

export default AddAdditionalInfoPage;