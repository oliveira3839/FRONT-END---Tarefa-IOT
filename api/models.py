from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.sql import func
import os
from werkzeug.security import generate_password_hash, check_password_hash

DATABASE_URL = os.environ.get('DATABASE_URL')
if not DATABASE_URL:
    raise ValueError("Variável de ambiente DATABASE_URL não definida!")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=1800,
    pool_size=10, 
    max_overflow=20, 
    pool_timeout=30, 
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- Definição das Tabelas (Models) ---

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    area_saber = Column(String, nullable=False)
    materia = Column(String, nullable=False)
    image_url = Column(String, nullable=True)
    project_link = Column(String, nullable=True)
    votes = Column(Integer, nullable=False, default=0)

class Contact(Base):
    __tablename__ = "contacts"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True) 
    username = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Hobby(Base):
    __tablename__ = "hobbies"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    image_url = Column(String, nullable=True)

# =========================================================
# === TABELAS PARA CURRÍCULO ========================
# =========================================================

# 1. Informações Gerais (Contém todos os dados pessoais e links)
class GeneralInfo(Base):
    __tablename__ = "general_info"
    id = Column(Integer, primary_key=True, index=True) 

    main_name = Column(String, nullable=True)      # Nome principal na Home
    full_name = Column(String, nullable=True)      # Nome completo
    address = Column(String, nullable=True)        # Endereço
    phone = Column(String, nullable=True)          # Telefone
    email = Column(String, nullable=True)          # Email (para o currículo)
    responsible = Column(String, nullable=True)    # Contato do Responsável
    profile_pic_url = Column(String, nullable=True) 
    pdf_url = Column(String, nullable=True)         
    objective = Column(Text, nullable=True)        # HOME: Texto principal
    resume_summary = Column(Text, nullable=True)   # CURRÍCULO: Objetivo
    informal_intro = Column(Text, nullable=True)   # Texto introdutório informal
    experience_fallback_text = Column(Text, nullable=True) # Texto p/ "Sem Experiência"
    
    # --- INTERRUPTORES PARA OCULTAR SEÇÕES ---
    # Adicionado server_default='true' para garantir que o BD tenha o valor
    show_education = Column(Boolean, nullable=False, default=True, server_default='true')
    show_skills = Column(Boolean, nullable=False, default=True, server_default='true')
    show_additional_info = Column(Boolean, nullable=False, default=True, server_default='true')

    # ================================================================
    # ===CAMPOS PARA LINKS SOCIAIS DA HOMEPAGE ===
    # ================================================================
    linkedin_url = Column(String, nullable=True)
    github_url = Column(String, nullable=True)
    email_address = Column(String, nullable=True) # Email para o link "social" da Home

    show_linkedin = Column(Boolean, nullable=False, default=True, server_default='true')
    show_github = Column(Boolean, nullable=False, default=True, server_default='true')
    show_email = Column(Boolean, nullable=False, default=True, server_default='true')
    
# 2. Experiência Profissional
class Experience(Base):
    __tablename__ = "experiences"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False) 
    company = Column(String, nullable=False) 
    start_date = Column(String, nullable=False) 
    end_date = Column(String, nullable=True) 
    description = Column(Text, nullable=True) 

# 3. Formação Acadêmica (Corrigido)
class Education(Base):
    __tablename__ = "education"
    id = Column(Integer, primary_key=True, index=True)
    degree = Column(String, nullable=False) 
    institution = Column(String, nullable=False) 
    details = Column(Text, nullable=True) 
    start_date = Column(String, nullable=False)
    end_date = Column(String, nullable=False)

# 4. Habilidades Técnicas (Skills)
class Skill(Base):
    __tablename__ = "skills"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False) 
    category = Column(String, nullable=True) 

# 5. Informações Adicionais
class AdditionalInfo(Base):
    __tablename__ = "additional_info"
    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=False) 

# =========================================================

def get_db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    Base.metadata.create_all(bind=engine)