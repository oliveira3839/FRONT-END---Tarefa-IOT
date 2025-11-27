from flask import Flask
from flask_cors import CORS
import cloudinary # <-- NOVO IMPORT
from dotenv import load_dotenv # Importado primeiro
import os

# Carrega as variáveis de ambiente ANTES de qualquer outra coisa
# Isso garante que 'os.environ.get' funcione em todo lugar
load_dotenv() 

def create_app():
    
    app = Flask(__name__)
    
    # Configuração de CORS atualizada
    CORS(app, resources={
        r"/api/*": {
            "origins": "*", 
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    # Carrega a URL do banco
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        raise RuntimeError("DATABASE_URL não está configurada!")
    
    # Carrega a nova chave secreta do JWT (agora deve funcionar)
    jwt_secret = os.environ.get('JWT_SECRET_KEY')
    if not jwt_secret:
        raise RuntimeError("JWT_SECRET_KEY não está configurada!")
    
    app.config['JWT_SECRET_KEY'] = jwt_secret

    # ===============================================
    # === NOVA CONFIGURAÇÃO DO CLOUDINARY =========
    # ===============================================
    # Adicionado ANTES de inicializar as rotas
    try:
        cloudinary.config( 
            cloud_name = os.environ.get('CLOUDINARY_CLOUD_NAME'), 
            api_key = os.environ.get('CLOUDINARY_API_KEY'), 
            api_secret = os.environ.get('CLOUDINARY_API_SECRET'),
            secure=True
        )
        print("Cloudinary configurado com sucesso.") # Feedback para você
    except Exception as e:
        print(f"ERRO AO CONFIGURAR CLOUDINARY: {e}")
        print("Verifique suas variáveis de ambiente CLOUDINARY_...")
    # ===============================================

    # Inicializa o banco (como você já fazia)
    from . import database
    database.init_app(app)

    # Inicializa as rotas (como você já fazia)
    from . import routes
    routes.init_routes(app)

    return app

# Cria a aplicação (como você já fazia)
app = create_app()
