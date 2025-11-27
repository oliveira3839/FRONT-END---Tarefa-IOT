import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axiosConfig';
import ProjectCard from '../components/ProjectCard';
import { FaLinkedin, FaGithub, FaEnvelope } from 'react-icons/fa';
import { Link } from 'react-router-dom'; 

const DEFAULT_PROFILE_PIC = "https://placehold.co/150x150/e9ecef/adb5bd?text=M";

function HomePage() {
  const [projectsByArea, setProjectsByArea] = useState({});
  const [sortedAreaKeys, setSortedAreaKeys] = useState([]);
  const [profilePicUrl, setProfilePicUrl] = useState(DEFAULT_PROFILE_PIC);
  
  // O generalInfo inclui os links e as flags de visibilidade
  const [generalInfo, setGeneralInfo] = useState({
    objective: '',
    main_name: '',
    profile_pic_url: '',
    // Campos para os links
    linkedin_url: '',
    github_url: '',
    email_address: '',
    show_linkedin: false, // Inicia como falso para evitar "piscar"
    show_github: false,
    show_email: false,
  });

  const [refreshKey, setRefreshKey] = useState(0); 
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjects = useCallback(() => {
    api.get('/api/projects')
      .then(response => {
        const data = response.data;
        const sortedData = {};
        for (const area in data) {
          const projects = data[area];
          if (Array.isArray(projects)) {
            const sortedProjects = projects.sort((a, b) => parseInt(a.id) - parseInt(b.id));
            sortedData[area] = sortedProjects;
          }
        }
        const keys = Object.keys(sortedData);
        keys.sort((areaA, areaB) => {
          const projectsA = sortedData[areaA];
          const projectsB = sortedData[areaB];
          const oldestIdA = parseInt((projectsA[0] || {id: Infinity}).id);
          const oldestIdB = parseInt((projectsB[0] || {id: Infinity}).id);
          return oldestIdA - oldestIdB;
        });
        setProjectsByArea(sortedData); 
        setSortedAreaKeys(keys);
      })
      .catch(error => console.error("Houve um erro ao buscar os projetos!", error));
  }, []);

  // Fetch inicial
  useEffect(() => {
    fetchProjects();
    
    setIsLoading(true);

    api.get('/api/general-info')
      .then(response => {
        const data = response.data;
        // --- SETSTATE ---
        // Preenche o estado com os novos dados da API
        setGeneralInfo({
            objective: data.objective || '',
            main_name: data.main_name || '',
            profile_pic_url: data.profile_pic_url || '',
            // Preenche os novos campos
            linkedin_url: data.linkedin_url || '',
            github_url: data.github_url || '',
            email_address: data.email_address || '',
            // Garante que é um booleano
            show_linkedin: !!data.show_linkedin, 
            show_github: !!data.show_github,
            show_email: !!data.show_email,
        });
        setProfilePicUrl(data.profile_pic_url || DEFAULT_PROFILE_PIC);
      })
      .catch(error => console.error("Houve um erro ao buscar General Info!", error))
      .finally(() => {
          setIsLoading(false); 
      });
  }, [fetchProjects]);

  // Função de voto
  const handleVoteUpdate = (updatedProject) => {
    const area = updatedProject.area_saber || updatedProject.area || updatedProject.category;

    if (!area) {
      console.warn("⚠️ updatedProject sem área! Dados recebidos:", updatedProject);
      return;
    }

    setProjectsByArea(prev => {
      const currentArea = prev[area] || [];
      const updatedArea = currentArea.map(p =>
        p.id === updatedProject.id 
          ? { ...updatedProject }
          : p
      );
      return {
        ...prev,
        [area]: updatedArea
      };
    });

    setRefreshKey(k => k + 1);

    setTimeout(() => {
      fetchProjects();
      setRefreshKey(k => k + 1);
    }, 500);
  };

  
  // --- Funções de Renderização Condicional ---
  
  const defaultObjective = "Sou Marcelo, tenho 18 anos, e estudo Internet das Coisas (IoT) no Senac Nações Unidas. Tenho um grande interesse por tecnologia, inovação e segurança digital, e busco minha primeira oportunidade profissional para aplicar meus conhecimentos e evoluir na área. Sou curioso, dedicado e colaborativo, sempre em busca de aprender mais e entregar o meu melhor em cada desafio.";
  // Usa o fallback defaultObjective apenas se o texto da API estiver vazio E não estiver carregando
  const objectiveText = isLoading ? '' : (generalInfo.objective || defaultObjective);
  const mainName = generalInfo.main_name || "Marcelo Antony Accacio Olhier";


  const renderImage = () => {
    if (isLoading) {
      // Placeholder circular para a imagem
      return (
        <div 
          style={{
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            backgroundColor: '#ccc', 
            margin: '0 auto 20px',
            opacity: 0.5 
          }}
        ></div>
      );
    }
    
    // Imagem carregada (ou fallback)
    return <img src={profilePicUrl} alt="Foto do Aluno" />;
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '80%', height: '18px', backgroundColor: '#f0f0f0', borderRadius: '4px', margin: '5px auto' }}></div>
          <div style={{ width: '60%', height: '18px', backgroundColor: '#f0f0f0', borderRadius: '4px', margin: '5px auto' }}></div>
        </div>
      );
    }

    return (
      <p>
        {objectiveText}{' '}
        {' '}
        <Link to="/sobremim" className="link-effect">
          sobre mim!
        </Link>
      </p>
    );
  };

  // --- RENDERIZAÇÃO DOS LINKS SOCIAIS ---
  const renderSocialLinks = () => {
    // Se estiver carregando, não mostre nada
    if (isLoading) return null;

    // Se nenhum link estiver habilitado, não mostre a seção
    if (!generalInfo.show_linkedin && !generalInfo.show_github && !generalInfo.show_email) {
      return null;
    }

    return (
      <div className="social-links">
        {/* 1. Renderiza LinkedIn se show_linkedin for true E a URL existir */}
        {generalInfo.show_linkedin && generalInfo.linkedin_url && (
          <a href={generalInfo.linkedin_url} target="_blank" rel="noopener noreferrer">
            <FaLinkedin size={24} />
            <span>LinkedIn</span>
          </a>
        )}
        
        {/* 2. Renderiza GitHub se show_github for true E a URL existir */}
        {generalInfo.show_github && generalInfo.github_url && (
          <a href={generalInfo.github_url} target="_blank" rel="noopener noreferrer">
            <FaGithub size={24} />
            <span>GitHub</span>
          </a>
        )}
        
        {/* 3. Renderiza Email se show_email for true E o endereço existir */}
        {generalInfo.show_email && generalInfo.email_address && (
          <a href={`mailto:${generalInfo.email_address}`}>
            <FaEnvelope size={24} />
            <span>Email</span>
          </a>
        )}
      </div>
    );
  };
  

  return (
    <div className="container">
      <section className="about-section">
        
        {renderImage()}
        
        <h2>{isLoading ? 'Carregando...' : mainName}</h2> 
        
        {renderContent()}
        
        {renderSocialLinks()}
        
      </section>

      <section id="projects">
        <h2 className="page-title">Meus Trabalhos</h2>
        
        {sortedAreaKeys.map(area => (
          <div key={area}>
            <h3 className="area-saber-titulo">
              {area}
            </h3>
            <div className="project-grid">
              {projectsByArea[area] && projectsByArea[area].map(project => (
                <ProjectCard 
                  key={`${project.id}-${refreshKey}`} 
                  project={project} 
                  onVote={handleVoteUpdate} 
                />
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

export default HomePage;