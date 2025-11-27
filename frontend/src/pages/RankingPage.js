import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { MdEmojiEvents } from 'react-icons/md';

const LoadingComponent = () => (
  <div className="container loading-container">
    <h2 className="page-title">Carregando Ranking...</h2>
    <p style={{ textAlign: 'center' }}>Aguarde um momento...</p>
  </div>
);

//Destaca os 3 primeiros com medalhas
const getRankDetails = (index) => {
  switch (index) {
    case 0:
      return { className: 'top-rank-1', medal: <MdEmojiEvents /> };
    case 1:
      return { className: 'top-rank-2', medal: <MdEmojiEvents /> };
    case 2:
      return { className: 'top-rank-3', medal: <MdEmojiEvents /> };
    default:
      return { className: '', medal: null };
  }
};

function RankingPage() {
  const [rankedProjects, setRankedProjects] = useState([]);
  const [hasVotes, setHasVotes] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/api/projects/ranked')
      .then(response => {
        setHasVotes(response.data.hasVotes);
        setRankedProjects(response.data.projects);
      })
      .catch(error => {
        console.error("Houve um erro ao buscar o ranking!", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <LoadingComponent />;
  }

  return (
    <div className="container">
      <h2 className="page-title">Ranking de Projetos</h2>
      <p style={{ textAlign: 'center', marginBottom: '30px' }}>
        Projetos mais votados pela comunidade.
      </p>

      {!hasVotes ? (
        <p style={{ textAlign: 'center', fontStyle: 'italic', marginTop: '40px' }}>
          Ainda não há votos registrados. Seja o primeiro a votar!
        </p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Posição</th>
              <th>Nome do Projeto</th>
              <th>Descrição</th>
              <th>Total de Votos</th>
            </tr>
          </thead>
          <tbody>
            {rankedProjects.map((project, index) => {
              const { className, medal } = getRankDetails(index);

              return (
                <tr key={project.id}>
                  <td data-label="Posição" className={className}>
                    {index + 1}º
                    {medal && <span className="rank-medal">{medal}</span>}
                  </td>
                  <td data-label="Projeto">{project.name}</td>
                  <td data-label="Descrição">{project.description}</td>
                  <td data-label="Votos">{project.votes}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default RankingPage;