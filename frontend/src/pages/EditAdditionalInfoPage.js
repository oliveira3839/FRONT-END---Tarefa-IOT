import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import api from '../api/axiosConfig'; 
import { FaArrowLeft, FaSave, FaTrash } from 'react-icons/fa';

function EditAdditionalInfoPage({ isAuthenticated }) {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const [text, setText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        // Adiciona verificação de autenticação
        if (!isAuthenticated) {
            navigate('/admin');
            return;
        }

        const fetchItem = async () => {
            try {
                const response = await api.get(`/api/additional-info/${id}`);
                setText(response.data.text);
                setIsLoading(false);
            } catch (err) {
                console.error("Erro ao buscar item:", err.response || err);
                setError('Erro ao carregar o item. Item não encontrado ou erro de conexão.');
                setIsLoading(false);
            }
        };
        fetchItem();
    }, [id, isAuthenticated, navigate]); // Adiciona dependências

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setIsSaving(true);

        if (!text.trim()) {
            setError('O campo de texto é obrigatório.');
            setIsSaving(false);
            return;
        }

        try {
            await api.put(`/api/additional-info/${id}`, { text });
            setMessage('Item atualizado com sucesso!');
            setTimeout(() => {
                navigate('/admin/curriculum');
            }, 1000);
        } catch (err) {
            console.error("Erro ao atualizar item:", err.response || err);
            setError(err.response?.data?.error || 'Erro ao atualizar a informação adicional.');
        } finally {
            setIsSaving(false);
        }
    };

    // --- FUNÇÃO DE DELETAR ---
    const handleDelete = async () => {
        const confirmDelete = window.confirm(`Tem certeza que quer deletar este item? (ID: ${id})`);
        
        if (confirmDelete) {
            setMessage('');
            setError('');
            setIsSaving(true);
            
            try {
                await api.delete(`/api/additional-info/${id}`);
                setMessage('Item deletado com sucesso! Redirecionando...');
                setTimeout(() => {
                    navigate('/admin/curriculum');
                }, 1500);
            } catch (err) {
                console.error("Erro ao deletar item:", err.response || err);
                setError(err.response?.data?.error || 'Erro ao deletar a informação.');
                setIsSaving(false);
            }
        }
    };

    if (isLoading) {
        return <div className="container"><h1 className="page-title">Carregando Item...</h1></div>;
    }
    
    // Se deu erro ao carregar E não tem texto, mostra o erro
    if (error && !text) {
        return (
            <div className="container">
                <h1 className="page-title">Erro</h1>
                <p className="form-message error">{error}</p>
                <Link to="/admin/curriculum" className="back-to-admin" style={{marginTop: '20px'}}>
                    <FaArrowLeft /> Voltar ao Painel do Currículo
                </Link>
            </div>
        );
    }

    return (
        <div className="container">
            <h1 className="page-title">Editar Informação Adicional (ID: {id})</h1>
            
            <Link to="/admin/curriculum" className="back-to-admin">
                <FaArrowLeft /> Voltar ao Painel do Currículo
            </Link>
            
            <form onSubmit={handleSubmit} className="contact-form" style={{marginTop: '20px'}}>
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

                {/* --- BOTÕES DE AÇÃO (SALVAR E DELETAR) --- */}
                <div className="admin-actions" style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" disabled={isSaving} className="add-button">
                        {isSaving ? 'Salvando...' : <><FaSave /> Salvar Alterações</>}
                    </button>
                    
                    <button 
                        type="button" 
                        disabled={isSaving} 
                        className="danger-button" 
                        onClick={handleDelete}
                    >
                        {isSaving ? '...' : <><FaTrash /> Deletar</>}
                    </button>
                </div>
                
                {/* Mostra erros do submit aqui */}
                {error && <p className="form-message error">{error}</p>}
                {message && <p className="form-message success">{message}</p>}
            </form>
        </div>
    );
}

export default EditAdditionalInfoPage;