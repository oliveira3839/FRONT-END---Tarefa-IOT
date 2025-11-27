import click
from flask.cli import with_appcontext
from sqlalchemy.orm import Session
from .models import SessionLocal, Project, Contact, User, create_tables, Base, engine
import os  # Importamos o OS para ler o .env

# Função helper para usar a sessão nos comandos CLI
def db_session_decorator(func):
    @with_appcontext
    def wrapper(*args, **kwargs):
        db: Session = SessionLocal()
        try:
            result = func(db, *args, **kwargs)
            db.commit()
            return result
        except Exception as e:
            db.rollback()
            click.echo(f"Erro no banco de dados: {e}")
            raise
        finally:
            db.close()
    wrapper.__name__ = func.__name__
    wrapper.__doc__ = func.__doc__
    return wrapper

@click.command('init-db')
@with_appcontext
def init_db_command():
    """Apaga e recria as tabelas do banco de dados."""
    try:
        # 1. Apaga todas as tabelas existentes
        Base.metadata.drop_all(bind=engine)
        click.echo('Tabelas antigas apagadas com sucesso.')
        
        # 2. Cria as tabelas novamente (agora com a nova coluna)
        create_tables()
        click.echo('Tabelas novas recriadas com sucesso.')
    except Exception as e:
        click.echo(f"Erro ao recriar tabelas: {e}")

# =========================================================
# ===CRIAR O PRIMEIRO ADMIN ================
# =========================================================
@click.command('create-admin')
@click.argument('username')
@db_session_decorator
def create_admin_command(db: Session, username):
    """Cria um usuário admin inicial."""
    # Pega a senha do arquivo .env
    admin_pass = os.environ.get('ADMIN_PASSWORD')
    if not admin_pass:
        click.echo('Erro: ADMIN_PASSWORD não definida no arquivo .env')
        return

    # Verifica se o usuário já existe
    existing_user = db.query(User).filter(User.username == username).first()
    if existing_user:
        click.echo(f'Usuário "{username}" já existe.')
        return
        
    # Cria o novo usuário
    new_admin = User(username=username)
    new_admin.set_password(admin_pass)  # Hasheia a senha
    db.add(new_admin)
    
    click.echo(f'Usuário admin "{username}" criado com sucesso!')

@click.command('reset-votes')
@db_session_decorator
def reset_votes_command(db: Session):
    """Reseta a contagem de votos de todos os projetos para 0."""
    updated_count = db.query(Project).update({Project.votes: 0})
    click.echo(f'{updated_count} projetos tiveram seus votos resetados para 0.')

@click.command('reset-messages')
@db_session_decorator
def reset_messages_command(db: Session):
    """Apaga todas as mensagens da tabela de contatos."""
    deleted_count = db.query(Contact).delete()
    click.echo(f'{deleted_count} mensagens de contato foram apagadas.')

def init_app(app):
    app.cli.add_command(init_db_command)
    app.cli.add_command(create_admin_command)
    app.cli.add_command(reset_votes_command)
    app.cli.add_command(reset_messages_command)