from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configura a URL do banco
database_url = os.environ.get('DATABASE_URL')
if not database_url:
    raise RuntimeError("DATABASE_URL não está configurada!")

# Importa e inicializa o database
from . import database
database.init_app(app)

# Importa e registra as rotas
from . import routes
routes.init_routes(app)

# Handler para a Vercel
def handler(request):
    return app(request.environ, request.start_response)