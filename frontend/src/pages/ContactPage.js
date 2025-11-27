import React, { useState, useEffect } from 'react';
import ContactForm from '../components/ContactForm';
import api from '../api/axiosConfig';

const LoadingComponent = () => (
  <div className="container loading-container">
    <h2 className="page-title">Carregando formulário de contato...</h2>
    <p style={{ textAlign: 'center' }}>Aguarde um momento...</p>
  </div>
);

function ContactPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/api/general-info')
      .catch(error => {
        console.warn("Chamada de aquecimento do servidor falhou (ignorar se esperado).", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);
  //-----------------------------------------------------

  // Verificação de Loading ---
  if (isLoading) {
    return <LoadingComponent />;
  }
  //-----------------------------------------

  return (
    <div className="container">
      <ContactForm />
    </div>
  );
}

export default ContactPage;