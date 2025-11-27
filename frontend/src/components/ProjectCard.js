import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

function ProjectCard({ project, onVote }) {
  // Estado local que atualiza quando as props mudam
  const [currentVotes, setCurrentVotes] = useState(project.votos ?? project.votes ?? 0);

  // Atualiza o estado local sempre que o project mudar
  useEffect(() => {
    setCurrentVotes(project.votos ?? project.votes ?? 0);
  }, [project.votos, project.votes, project.id]);
  
  const handleVote = () => {
    // Atualização otimista (imediata)
    setCurrentVotes(prev => prev + 1);

    api.post(`/api/projects/${project.id}/vote`)
      .then(response => {
        // Atualiza com o valor real do servidor
        const realVotes = response.data.votos ?? response.data.votes ?? currentVotes + 1;
        setCurrentVotes(realVotes);
        onVote(response.data);
      })
      .catch(error => {
        // Se der erro, volta pro valor anterior
        setCurrentVotes(prev => prev - 1);
        console.error("Houve um erro ao votar!", error);
      });
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const words = name.split(' ');
    if (words.length > 1) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="project-card">
      
      {project.image_url ? (
        <img 
          src={project.image_url} 
          alt={project.name} 
          className="project-card-image"
        />
      ) : (
        <div className="image-placeholder">
          <span>{getInitials(project.name)}</span>
        </div>
      )}
      
      <div className="project-card-content">
        <h3>{project.name}</h3>
        <span className="project-card-materia">{project.materia}</span>
        <p>{project.description}</p>
        <div className="project-card-footer">

          <button 
            className="vote-button" 
            onClick={handleVote} 
          >
            Votar ({currentVotes})
          </button>
          
          {project.project_link && (
            <a href={project.project_link} target="_blank" rel="noopener noreferrer">
              Ver Projeto
            </a>
          )}

        </div>
      </div>
    </div>
  );
}

export default ProjectCard;