import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { FaDownload, FaPrint } from 'react-icons/fa';

// Estilos
const curriculumStyle = {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
    lineHeight: '1.6'
};
const sectionTitleStyle = {
    marginBottom: '15px',
    marginTop: '10px',
    color: 'var(--text-primary)',
    fontWeight: '600',
    fontSize: '1.5em',
};
const separatorStyle = {
    border: 'none',
    borderTop: '2px solid rgba(0, 0, 0, 0.08)',
    margin: '30px 0'
};
const personalInfoStyle = {
    textAlign: 'center',
    marginBottom: '0',
    color: 'var(--text-secondary)'
};

// CONSTANTES PADRÃO (FALLBACKS)
const DEFAULT_CONSTS = {
    NAME: "Seu Nome",
    CONTACT_INFO: "Telefone: (11) 9XXXX-XXXX | E-mail: seuemail@gmail.com",
    ADDRESS: "Endereço: Seu endereço",
    RESPONSIBLE: "Responsável: (11) 9XXXX-XXXX (Mãe)",
    OBJECTIVE: "Busco minha primeira oportunidade profissional. Desejo ingressar no mercado para adquirir experiência prática, colocar em uso meus conhecimentos técnicos e desenvolver novas habilidades que me ajudem a crescer profissionalmente.",
    DEFAULT_EXPERIENCE_FALLBACK: "Em busca da primeira oportunidade profissional.",
    DEFAULT_EDUCATION: [
      { id: 'default-1', degree: 'Ex: Técnico em Desenvolvimento de Sistemas', institution: 'Ex: ETEC/SENAI', start_date: 'Jan/2023', end_date: 'Dez/2024', details: 'Ex: Destaque acadêmico em Projetos.' }
    ],
    DEFAULT_SKILLS: [
      { id: 'default-s1', category: 'Técnica', name: 'Ex: JavaScript' },
      { id: 'default-s2', category: 'Soft Skill', name: 'Ex: Comunicação' },
      { id: 'default-s3', category: 'Idioma', name: 'Ex: Inglês (Básico)' }
    ],
    DEFAULT_ADDITIONAL_INFO: [
      { id: 'default-a1', text: 'Ex: Disponibilidade para início imediato.' },
      { id: 'default-a2', text: 'Ex: CNH Categoria B.' }
    ]
};


function CurriculumPage() {
    const [info, setInfo] = useState({
        show_education: true,
        show_skills: true,
        show_additional_info: true
    });
    const [experiences, setExperiences] = useState([]);
    const [education, setEducation] = useState([]);
    const [skills, setSkills] = useState([]);
    const [additionalInfo, setAdditionalInfo] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);
    const downloadUrl = `${api.defaults.baseURL}/api/download/curriculo`;

    // --- Lógica de Ordenação das Habilidades ---
    const groupSkills = (skillsArray) => {
        const grouped = skillsArray.reduce((acc, skill) => {
            const category = skill.category || 'Geral'; 
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(skill.name);
            return acc;
        }, {});
        
        // --- LÓGICA DE ORDENAÇÃO ---
        const desiredOrder = ['Técnica', 'Soft Skill', 'Idioma', 'Outras'];
        
        const getSortIndex = (category) => {
            const index = desiredOrder.indexOf(category);
            // Se não encontrar, joga para o fim (ex: 'Geral' ou os exemplos)
            return index === -1 ? 99 : index; 
        };

        const sortedCategories = Object.keys(grouped).sort((a, b) => {
            return getSortIndex(a) - getSortIndex(b);
        });

        // Mapeia usando a array ordenada
        return sortedCategories.map(category => ({
            category: category,
            names: grouped[category]
        }));
    };

    // Imprimir PDF ---
    const handlePrint = async () => {
        try {
            const response = await fetch(downloadUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = url;
            document.body.appendChild(iframe);
            iframe.onload = () => {
                iframe.contentWindow.print();
            };
        } catch (error) {
            console.error("Erro ao abrir PDF para impressão:", error);
            alert("Não foi possível abrir o PDF para impressão.");
        }
    };
    
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [infoRes, expRes, eduRes, skillRes, addInfoRes] = await Promise.all([
                    api.get('/api/general-info'),
                    api.get('/api/experiences'),
                    api.get('/api/education'),
                    api.get('/api/skills'),
                    api.get('/api/additional-info'), 
                ]);
                
                setInfo(infoRes.data);
                setExperiences(expRes.data);
                setEducation(eduRes.data);
                setSkills(skillRes.data);
                setAdditionalInfo(addInfoRes.data); 
                
            } catch (error) {
                console.error("Erro ao buscar dados do currículo:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllData();
    }, []);

    if (isLoading) {
        return <div className="container"><h2 className="page-title">Carregando Currículo...</h2>
        <p style={{ textAlign: 'center' }}>Aguarde um momento...</p></div>

    }

    // --- Lógica de Placeholders ---
    const educationToRender = education.length > 0 ? education : DEFAULT_CONSTS.DEFAULT_EDUCATION;
    const additionalInfoToRender = additionalInfo.length > 0 ? additionalInfo : DEFAULT_CONSTS.DEFAULT_ADDITIONAL_INFO;
    const skillsToRender = skills.length > 0 ? skills : DEFAULT_CONSTS.DEFAULT_SKILLS;
    const groupedSkills = groupSkills(skillsToRender);
    
    // --- Constantes de Cabeçalho ---
    const fullName = info.full_name || DEFAULT_CONSTS.NAME;
    const addressLine = info.address ? `Endereço: ${info.address}` : DEFAULT_CONSTS.ADDRESS;
    const contactParts = [];
    if (info.phone) contactParts.push(`Telefone: ${info.phone}`);
    if (info.email) contactParts.push(`E-mail: ${info.email}`);
    const contactLine = contactParts.length > 0 ? contactParts.join(' | ') : DEFAULT_CONSTS.CONTACT_INFO;
    const responsibleLine = info.responsible ? `Responsável: ${info.responsible}` : DEFAULT_CONSTS.RESPONSIBLE;
    const objectiveText = info.resume_summary || DEFAULT_CONSTS.OBJECTIVE;
    const experienceFallback = info.experience_fallback_text !== undefined && info.experience_fallback_text !== null 
                               ? info.experience_fallback_text 
                               : DEFAULT_CONSTS.DEFAULT_EXPERIENCE_FALLBACK;


    // --- Lógica para Ocultar a última linha <hr> ---
    const sectionsVisibility = {
        objective: !!objectiveText,
        education: info.show_education,
        // Se a experiência estiver vazia E o fallback for "" (vazio), ela não aparece
        experience: (experiences.length > 0 || (experienceFallback && experienceFallback !== "")), 
        skills: info.show_skills,
        additionalInfo: info.show_additional_info
    };

    const visibleSectionKeys = Object.keys(sectionsVisibility)
                                   .filter(key => sectionsVisibility[key]);
    
    const lastVisibleSectionKey = visibleSectionKeys.length > 0 
                                  ? visibleSectionKeys[visibleSectionKeys.length - 1] 
                                  : '';


    return (
        <div className="container">
            <h2 className="page-title">Currículo</h2>

            <div style={curriculumStyle}>
                {/* --- 1. INFORMAÇÕES PESSOAIS --- */}
                <div style={personalInfoStyle}>
                    <h1 style={{fontSize: '2.5em'}}>{fullName}</h1>
                    <p style={{whiteSpace: 'pre-line'}}>
                        {addressLine}<br />
                        {contactLine}<br />
                        {responsibleLine}
                    </p>
                </div>
                {/* A primeira linha é estática, sempre aparece */}
                <hr style={separatorStyle} /> 

                {/* --- 2. OBJETIVO --- */}
                {sectionsVisibility.objective && (
                    <>
                        <h3 style={sectionTitleStyle}>Objetivo</h3>
                        <p style={{color: 'var(--text-secondary)'}}>
                            {objectiveText}
                        </p>
                        {/* Só mostra o HR se NÃO for a última seção */}
                        {lastVisibleSectionKey !== 'objective' && <hr style={separatorStyle} />}
                    </>
                )}

                {/* --- 3. FORMAÇÃO ACADÊMICA --- */}
                {sectionsVisibility.education && (
                    <>
                        <h3 style={sectionTitleStyle}>Formação Acadêmica</h3>
                        {educationToRender.map(edu => (
                            <div key={edu.id} style={{ marginBottom: '20px' }}>
                                <p style={{ fontWeight: '600', margin: 0, color: 'var(--text-primary)' }}>
                                    {edu.degree}
                                </p>
                                <p style={{ margin: '5px 0', color: 'var(--text-secondary)' }}>
                                    {edu.institution} - {edu.start_date} a {edu.end_date}
                                </p>
                                {edu.details && (
                                    <p style={{ fontStyle: 'italic', color: 'var(--text-tertiary)', fontSize: '0.9em'}}>
                                        {edu.details}
                                    </p>
                                )}
                            </div>
                        ))}
                        {/* Só mostra o HR se NÃO for a última seção */}
                        {lastVisibleSectionKey !== 'education' && <hr style={separatorStyle} />}
                    </>
                )}


                {/* --- 4. EXPERIÊNCIA PROFISSIONAL --- */}
                {sectionsVisibility.experience && (
                    <>
                        <h3 style={sectionTitleStyle}>Experiência Profissional</h3>
                        {experiences.length === 0 ? (
                            <p style={{ color: 'var(--text-secondary)' }}>
                                {experienceFallback}
                            </p>
                        ) : (
                            experiences.map(exp => (
                                <div key={exp.id} style={{ marginBottom: '20px' }}>
                                    <p style={{ fontWeight: '600', margin: 0, color: 'var(--text-primary)' }}>
                                        {exp.title} - {exp.company}
                                    </p>
                                    <p style={{ margin: '5px 0 10px', color: 'var(--text-secondary)', fontSize: '0.9em' }}>
                                        {exp.start_date} a {exp.end_date}
                                    </p>
                                    <ul style={{ paddingLeft: '20px', margin: 0 }}>
                                        {exp.description.split('\n').map((item, i) => (
                                            item.trim() && <li key={i} style={{ color: 'var(--text-secondary)' }}>{item.trim()}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))
                        )}
                        {/* Só mostra o HR se NÃO for a última seção */}
                        {lastVisibleSectionKey !== 'experience' && <hr style={separatorStyle} />}
                    </>
                )}


                {/* --- 5. HABILIDADES --- */}
                {sectionsVisibility.skills && (
                    <>
                        <h3 style={sectionTitleStyle}>Competências e Habilidades</h3>
                        
                        <div style={{ paddingLeft: '0', margin: 0 }}>
                            {groupedSkills.map(group => (
                                <div key={group.category} style={{ marginBottom: '15px' }}>
                                    <strong style={{ 
                                        color: 'var(--text-primary)', 
                                        fontSize: '1.05em', 
                                        display: 'block', 
                                        marginBottom: '5px' 
                                    }}>
                                        {group.category}:
                                    </strong>
                                    
                                    <ul style={{ paddingLeft: '20px', margin: 0, listStyleType: 'disc' }}>
                                        {group.names.map((name, i) => (
                                            <li key={`${group.category}-${i}`} style={{ color: 'var(--text-secondary)' }}>
                                                {name}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                        {/* Só mostra o HR se NÃO for a última seção */}
                        {lastVisibleSectionKey !== 'skills' && <hr style={separatorStyle} />}
                    </>
                )}
                
                {/* --- 6. INFORMAÇÕES ADICIONAIS --- */}
                {sectionsVisibility.additionalInfo && (
                    <>
                        <h3 style={sectionTitleStyle}>Informações Adicionais</h3>
                        <ul style={{ paddingLeft: '20px', margin: 0 }}>
                            {additionalInfoToRender.map(item => (
                                <li key={item.id} style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                                    {item.text}
                                </li>
                            ))}
                        </ul>
                        {/* A ÚLTIMA SEÇÃO POSSÍVEL NUNCA MOSTRA A LINHA */}
                    </>
                )}

            </div>

            {/* --- BOTÕES DE DOWNLOAD E IMPRESSÃO --- */}
{info.pdf_url ? ( 
    <div className="curriculum-buttons-container">
        <a 
            href={downloadUrl} 
            rel="noopener noreferrer" 
            className="download-button"
        >
            <FaDownload style={{marginRight: '8px'}}/> Baixar Currículo (PDF)
        </a>
        <button 
            onClick={handlePrint}
            className="download-button print-button"
        >
            <FaPrint style={{marginRight: '8px'}}/> Imprimir Currículo
        </button>
    </div>
) : (
    <p style={{textAlign: 'center', marginTop: '30px', color: 'var(--text-danger)'}}>
        O arquivo PDF do currículo ainda não foi carregado pelo administrador.
    </p>
)}
        </div>
    );
}

export default CurriculumPage;