from flask import request, jsonify, current_app, g
import requests
from flask import Response
import re
from sqlalchemy.orm import Session
from collections import defaultdict
from .models import get_db_session, Project, Contact, User, Hobby, GeneralInfo, Experience, Education, Skill, AdditionalInfo
from sqlalchemy.exc import IntegrityError
import jwt
from datetime import datetime, timedelta
from functools import wraps

import cloudinary.uploader
import cloudinary

# Decorador token_required
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        
        # Se o método for OPTIONS, permite a passagem para o CORS lidar.
        if request.method == 'OPTIONS':
            return jsonify({'message': 'Preflight request allowed.'}), 200
        # ============================

        token = None
        if 'Authorization' in request.headers:
            token_str = request.headers['Authorization']
            if token_str.startswith('Bearer '):
                token = token_str.split(' ')[1]
        if not token:
            return jsonify({'error': 'Token de autenticação está faltando!'}), 401
        try:
            secret_key = current_app.config['JWT_SECRET_KEY']
            data = jwt.decode(token, secret_key, algorithms=["HS256"])
            g.current_user_id = data['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expirou!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token é inválido!'}), 401
        return f(*args, **kwargs)
    return decorated


def init_routes(app):

    def get_db():
        db_session_generator = get_db_session()
        db = next(db_session_generator)
        try:
            yield db
        finally:
            db.close() 
            next(db_session_generator, None)

# Rota de Login
    @app.route('/api/login', methods=['POST'])
    def login():
        db: Session = next(get_db())
        try:
            data = request.get_json()
            if not data or not data.get('username') or not data.get('password'):
                return jsonify({'error': 'Usuário e senha são obrigatórios'}), 400

            # Pega o nome de usuário digitado
            username_digitado = data.get('username')
            # Normaliza
            username_normalizado = username_digitado.lower().strip()
            
            password = data.get('password')
            
            # Busca no banco
            user = db.query(User).filter(User.username == username_normalizado).first()

            if not user or not user.check_password(password):
                return jsonify({'error': 'Usuário ou senha incorretos'}), 401
                
            secret_key = current_app.config['JWT_SECRET_KEY']
            token_payload = {
                'user_id': user.id,
                'username': user.username,
                'exp': datetime.utcnow() + timedelta(hours=8)
            }
            token = jwt.encode(token_payload, secret_key, algorithm="HS256")
            
            return jsonify({
                'token': token,
                'username': user.username
            }), 200
            
        finally:
            db.close()


    @app.route('/api/admin/user-exists', methods=['GET'])
    def check_user_exists():
        """
        Verifica publicamente se algum usuário administrador já existe.
        """
        db: Session = next(get_db())
        try:
            user_count = db.query(User).count()
            return jsonify({'exists': user_count > 0}), 200
        except Exception as e:
            print(f"Erro ao checar usuários: {e}")
            return jsonify({'error': str(e)}), 500
        finally:
            db.close()

    @app.route('/api/admin/create-first-user', methods=['POST'])
    def create_first_user():
            """
            Cria o primeiro usuário administrador.
            Esta rota SÓ funciona se não houver nenhum outro usuário no banco.
            """
            db: Session = next(get_db())
            try:
                user_count = db.query(User).count()
                if user_count > 0:
                    return jsonify({'error': 'Um administrador já existe. Use a tela de login.'}), 403 # 403 Forbidden

                data = request.get_json()
                
                username_digitado = data.get('username')
                password = data.get('password')

                username_normalizado = None
                if username_digitado:
                    # Normaliza: converte para minúsculas e remove espaços extras
                    username_normalizado = username_digitado.lower().strip()

                # Verifica o nome de usuário JÁ normalizado
                if not username_normalizado or not password:
                    return jsonify({'error': 'Usuário e senha são obrigatórios.'}), 400

                # Salva o usuário com o nome normalizado no banco
                new_admin = User(username=username_normalizado)

                new_admin.set_password(password)
                
                db.add(new_admin)
                db.commit()
                
                return jsonify({'message': 'Administrador criado com sucesso! Agora você pode fazer login.'}), 201

            except IntegrityError: # Segurança extra caso dois tentem ao mesmo tempo
                db.rollback()
                return jsonify({'error': 'Esse nome de usuário já está em uso.'}), 409
            except Exception as e:
                db.rollback()
                print(f"Erro ao criar primeiro admin: {e}")
                return jsonify({'error': str(e)}), 500
            finally:
                db.close()


    @app.route('/api/admin/delete-user', methods=['DELETE', 'OPTIONS'])
    @token_required
    def delete_current_user():
        """
        Apaga o usuário administrador que está logado (identificado pelo token).
        """
        db: Session = next(get_db())
        user_id = g.current_user_id # Pega o ID do token
        
        try:
            user = db.query(User).filter(User.id == user_id).first()
            
            if not user:
                return jsonify({'error': 'Usuário não encontrado.'}), 404

            db.delete(user)
            db.commit()
            
            return jsonify({'message': 'Usuário administrador apagado com sucesso.'}), 200

        except Exception as e:
            db.rollback()
            print(f"Erro ao deletar usuário: {e}")
            return jsonify({'error': str(e)}), 500
        finally:
            db.close()

    # =========================================================
    # === ROTAS PÚBLICAS GERAIS ===============================
    # =========================================================
    # ... (Rotas get_ranked_projects, vote_for_project, submit_contact, download_curriculo) ...
    @app.route('/api/projects/ranked', methods=['GET'])
    def get_ranked_projects():
        db: Session = next(get_db())
        try:
            projects_query = db.query(Project).order_by(Project.votes.desc(), Project.id.asc()).all()
            has_votes = any(p.votes > 0 for p in projects_query)
            projects_list = []
            for project in projects_query:
                projects_list.append({
                    'id': project.id,
                    'name': project.name,
                    'description': project.description,
                    'votes': project.votes
                })
            return jsonify({
                'hasVotes': has_votes,
                'projects': projects_list
            }), 200
        finally:
            db.close()

    @app.route('/api/projects/<int:project_id>/vote', methods=['POST'])
    def vote_for_project(project_id):
        db: Session = next(get_db())
        try:
            project = db.query(Project).filter(Project.id == project_id).first()
            if not project:
                return jsonify({'error': 'Projeto não encontrado'}), 404
            project.votes += 1
            db.commit()
            db.refresh(project)
            project_dict = {c.name: getattr(project, c.name) for c in project.__table__.columns}
            return jsonify(project_dict), 200
        except Exception as e:
            db.rollback()
            print(f"Erro ao registrar voto: {e}")
            return jsonify({'error': f'Erro interno ao registrar voto: {str(e)}'}), 500
        finally:
            db.close()

    @app.route('/api/contacts', methods=['POST'])
    @app.route('/api/contact', methods=['POST']) 
    def submit_contact():
        db: Session = next(get_db())
        data = request.get_json() 
        name = data.get('name')
        email = data.get('email')
        message = data.get('message')
        if not name or not email or not message:
            return jsonify({'error': 'Nome, e-mail e mensagem são obrigatórios.'}), 400
        try:
            new_contact = Contact(name=name, email=email, message=message)
            db.add(new_contact)
            db.commit()
            db.refresh(new_contact)
            return jsonify({'message': 'Mensagem enviada com sucesso!'}), 201
        except Exception as e:
            db.rollback()
            print(f"Erro ao enviar mensagem: {e}")
            return jsonify({'error': 'Erro interno ao salvar a mensagem.'}), 500
        finally:
            db.close()

    @app.route('/api/download/curriculo', methods=['GET'])
    def download_curriculo():
        db: Session = next(get_db())
        try:
            info = db.query(GeneralInfo).first()
            if not info or not info.pdf_url:
                return jsonify({'error': 'Nenhum PDF de currículo encontrado no banco.'}), 404
            full_name = info.full_name or "Curriculo"
            first_name = full_name.split(' ')[0]
            last_name = full_name.split(' ').pop()
            clean_first = re.sub(r'[^a-zA-Z0-9]', '', first_name)
            clean_last = re.sub(r'[^a-zA-Z0-9]', '', last_name)
            pdf_filename = f"Curriculo_{clean_first}_{clean_last}.pdf".replace('__', '_')
            cloudinary_url = info.pdf_url
            r = requests.get(cloudinary_url, stream=True)
            if r.status_code != 200:
                print(f"Erro ao buscar PDF do Cloudinary. Status: {r.status_code}")
                return jsonify({'error': 'Não foi possível buscar o arquivo no Cloudinary.'}), r.status_code
            return Response(
                r.iter_content(chunk_size=1024),
                mimetype='application/pdf', 
                headers={
                    "Content-Disposition": f"attachment; filename=\"{pdf_filename}\""
                }
            )
        except Exception as e:
            print(f"Erro ao gerar download do currículo: {e}")
            return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500
        finally:
            db.close()


    # --- Rotas Públicas de Leitura (General Info, Lists) ---
    
    # =========================================================
    # === ROTA GET /api/general-info ===
    # =========================================================
    @app.route('/api/general-info', methods=['GET'])
    def get_general_info():
        db: Session = next(get_db())
        try:
            info = db.query(GeneralInfo).first()
            if not info:
                # Retorna um objeto padrão com todos os campos
                return jsonify({
                    'id': 1, 'full_name': None, 'address': None, 'phone': None, 
                    'email': None, 'responsible': None, 'profile_pic_url': None,
                    'pdf_url': None, 'objective': None, 'resume_summary': None,
                    'main_name': None, 'informal_intro': None,
                    'experience_fallback_text': None,
                    'show_education': True,
                    'show_skills': True,
                    'show_additional_info': True,
                    'linkedin_url': '',
                    'github_url': '',
                    'email_address': '',
                    'show_linkedin': True,
                    'show_github': True,
                    'show_email': True
                }), 200
            
            # Constrói o dicionário de resposta
            info_dict = {
                'id': info.id, 'full_name': info.full_name, 'address': info.address,
                'phone': info.phone, 'email': info.email, 'responsible': info.responsible,
                'profile_pic_url': info.profile_pic_url, 'pdf_url': info.pdf_url,
                'objective': info.objective, 'resume_summary': info.resume_summary,
                'main_name': info.main_name,
                'informal_intro': info.informal_intro,
                'experience_fallback_text': info.experience_fallback_text,
                'show_education': info.show_education,
                'show_skills': info.show_skills,
                'show_additional_info': info.show_additional_info,
                
                # Usar getattr para segurança caso a migração (models.py) ainda não tenha sido executada
                'linkedin_url': getattr(info, 'linkedin_url', ''),
                'github_url': getattr(info, 'github_url', ''),
                'email_address': getattr(info, 'email_address', ''),
                'show_linkedin': getattr(info, 'show_linkedin', True),
                'show_github': getattr(info, 'show_github', True),
                'show_email': getattr(info, 'show_email', True)
            }
            return jsonify(info_dict), 200
        except Exception as e:
            print(f"ERRO CRÍTICO AO LER GENERAL INFO: {e}")
            return jsonify({
                'error': ('Erro ao ler dados. O banco de dados pode estar fora de sincronia com os modelos. (Colunas ausentes?)')
            }), 500
        finally:
            db.close() 

    @app.route('/api/experiences', methods=['GET'])
    def get_experiences():
        db: Session = next(get_db())
        try:
            experiences = db.query(Experience).order_by(Experience.id.desc()).all()
            return jsonify([dict((col, getattr(exp, col)) for col in exp.__table__.columns.keys()) for exp in experiences])
        finally:
            db.close()
    
    @app.route('/api/education', methods=['GET'])
    def get_education():
        db: Session = next(get_db())
        try:
            education = db.query(Education).order_by(Education.id.desc()).all()
            return jsonify([dict((col, getattr(edu, col)) for col in edu.__table__.columns.keys()) for edu in education])
        finally:
            db.close()

    @app.route('/api/skills', methods=['GET'])
    def get_skills():
        db: Session = next(get_db())
        try:
            skills = db.query(Skill).order_by(Skill.category.asc(), Skill.name.asc()).all()
            return jsonify([dict((col, getattr(skill, col)) for col in skill.__table__.columns.keys()) for skill in skills])
        finally:
            db.close()
            
    @app.route('/api/additional-info', methods=['GET'])
    def get_additional_info():
        db: Session = next(get_db())
        try:
            info_items = db.query(AdditionalInfo).order_by(AdditionalInfo.id.asc()).all()
            return jsonify([dict((col, getattr(item, col)) for col in item.__table__.columns.keys()) for item in info_items])
        finally:
            db.close()
            
    @app.route('/api/projects', methods=['GET'])
    def get_projects():
        db: Session = next(get_db())
        try:
            projects_query = db.query(Project).order_by(Project.area_saber, Project.materia).all()
            grouped_projects = defaultdict(list)
            for project in projects_query:
                project_dict = {c.name: getattr(project, c.name) for c in project.__table__.columns}
                grouped_projects[project.area_saber].append(project_dict)
            return jsonify(grouped_projects)
        finally:
            db.close()


    # =========================================================
    # === ROTAS PROTEGIDAS (CRUD) =============================
    # =========================================================
    
    # =========================================================
    # === ROTA PUT /api/general-info ===
    # =========================================================
    @app.route('/api/general-info', methods=['PUT', 'OPTIONS'])
    @token_required
    def update_general_info():
        db: Session = next(get_db())
        data = request.form 
        files = request.files 
        info = db.query(GeneralInfo).first()
        if not info:
            info = GeneralInfo(id=1)
            db.add(info)
        try:
            # --- Lógica da Foto de Perfil---
            profile_pic_url_to_save = info.profile_pic_url 
            if 'profile_pic_file' in files:
                file_to_upload = files['profile_pic_file']
                if file_to_upload.filename != '':
                    upload_result = cloudinary.uploader.upload(file_to_upload, folder="perfil_portifolio", public_id="profile_pic")
                    profile_pic_url_to_save = upload_result.get('secure_url')
            elif 'profile_pic_url' in data:
                # Permite que a URL seja enviada (ou limpa)
                profile_pic_url_to_save = data.get('profile_pic_url') or None 
            
            # Só atualiza a URL se ela foi enviada no form (para não dar conflito)
            if 'profile_pic_file' in files or 'profile_pic_url' in data:
                 info.profile_pic_url = profile_pic_url_to_save

            # --- Lógica do PDF---
            pdf_url_to_save = info.pdf_url
            if 'pdf_file' in files:
                pdf_file_to_upload = files['pdf_file']
                if pdf_file_to_upload.filename != '':
                    upload_result = cloudinary.uploader.upload(pdf_file_to_upload, resource_type="raw", folder="curriculo_pdf", public_id="curriculo")
                    pdf_url_to_save = upload_result.get('secure_url')
            elif 'pdf_url' in data:
                pdf_url_to_save = data.get('pdf_url') or None
            
            if 'pdf_file' in files or 'pdf_url' in data:
                info.pdf_url = pdf_url_to_save

            # Verifica se a chave existe no form ANTES de atualizar
            # Isso impede que um formulário apague os dados do outro
            
            # Campos da AdminPage
            if 'main_name' in data:
                info.main_name = data.get('main_name', info.main_name)
            if 'objective' in data:
                 info.objective = data.get('objective', info.objective)
            if 'informal_intro' in data:
                 info.informal_intro = data.get('informal_intro', info.informal_intro)

            # Campos do CurriculumAdminPage
            if 'full_name' in data:
                info.full_name = data.get('full_name', info.full_name)
            if 'address' in data:
                info.address = data.get('address', info.address)
            if 'phone' in data:
                info.phone = data.get('phone', info.phone)
            if 'email' in data:
                info.email = data.get('email', info.email)
            if 'responsible' in data:
                info.responsible = data.get('responsible', info.responsible)
            if 'resume_summary' in data:
                info.resume_summary = data.get('resume_summary', info.resume_summary)
            if 'experience_fallback_text' in data:
                info.experience_fallback_text = data.get('experience_fallback_text', info.experience_fallback_text)

            # Checkboxes do Currículo
            if 'show_education' in data:
                info.show_education = data.get('show_education') == 'true'
            if 'show_skills' in data:
                info.show_skills = data.get('show_skills') == 'true'
            if 'show_additional_info' in data:
                info.show_additional_info = data.get('show_additional_info') == 'true'
            
            # Links Sociais (AdminPage)
            if 'linkedin_url' in data:
                info.linkedin_url = data.get('linkedin_url', info.linkedin_url)
            if 'github_url' in data:
                info.github_url = data.get('github_url', info.github_url)
            if 'email_address' in data:
                info.email_address = data.get('email_address', info.email_address)
            
            # Checkboxes dos Links Sociais (AdminPage)
            if 'show_linkedin' in data:
                info.show_linkedin = data.get('show_linkedin') == 'true'
            if 'show_github' in data:
                info.show_github = data.get('show_github') == 'true'
            if 'show_email' in data:
                info.show_email = data.get('show_email') == 'true'

            db.commit()
            db.refresh(info)
            
            # Retorna o objeto completo
            info_dict = {c.name: getattr(info, c.name) for c in info.__table__.columns}
            return jsonify(info_dict), 200
        
        except Exception as e:
            db.rollback()
            print(f"Erro ao atualizar General Info: {e}")
            if hasattr(e, 'message'):
                return jsonify({'error': f'Erro: {e.message}'}), 500
            return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500
        finally:
            db.close()

    # === CRUD: EXPERIENCES ===
    @app.route('/api/experiences', methods=['POST'])
    @token_required
    def add_experience():
        db: Session = next(get_db())
        data = request.get_json()
        if not all(data.get(k) for k in ['title', 'company', 'start_date', 'end_date']):
             return jsonify({'error': 'Campos obrigatórios faltando.'}), 400
        try:
            new_exp = Experience(
                title=data['title'], company=data['company'], 
                start_date=data['start_date'], end_date=data['end_date'],
                description=data.get('description', '')
            )
            db.add(new_exp)
            db.commit()
            db.refresh(new_exp) 
            return jsonify(dict((col, getattr(new_exp, col)) for col in new_exp.__table__.columns.keys())), 201
        except Exception as e:
            db.rollback()
            return jsonify({'error': f'Erro interno: {str(e)}'}), 500
        finally:
            db.close()


    @app.route('/api/experiences/<int:exp_id>', methods=['GET', 'OPTIONS'])
    @token_required
    def get_experience(exp_id):
        db: Session = next(get_db())
        try:
            exp = db.query(Experience).filter(Experience.id == exp_id).first()
            if not exp: return jsonify({'error': 'Experiência não encontrada'}), 404
            return jsonify(dict((col, getattr(exp, col)) for col in exp.__table__.columns.keys())), 200
        finally:
            db.close()


    @app.route('/api/experiences/<int:exp_id>', methods=['PUT', 'OPTIONS'])
    @token_required
    def update_experience(exp_id):
        db: Session = next(get_db())
        data = request.get_json()
        exp = db.query(Experience).filter(Experience.id == exp_id).first()
        if not exp: return jsonify({'error': 'Experiência não encontrada'}), 404
        if not all(data.get(k) for k in ['title', 'company', 'start_date', 'end_date']):
             return jsonify({'error': 'Campos obrigatórios faltando.'}), 400
        try:
            exp.title = data['title']
            exp.company = data['company']
            exp.start_date = data['start_date']
            exp.end_date = data['end_date']
            exp.description = data.get('description', exp.description)
            db.commit()
            db.refresh(exp) 
            return jsonify(dict((col, getattr(exp, col)) for col in exp.__table__.columns.keys())), 200
        except Exception as e:
            db.rollback()
            return jsonify({'error': f'Erro interno: {str(e)}'}), 500
        finally:
            db.close()


    @app.route('/api/experiences/<int:exp_id>', methods=['DELETE', 'OPTIONS'])
    @token_required
    def delete_experience(exp_id):
        db: Session = next(get_db())
        try:
            exp = db.query(Experience).filter(Experience.id == exp_id).first()
            if not exp: return jsonify({'error': 'Experiência não encontrada'}), 404
            db.delete(exp)
            db.commit()
            return jsonify({'success': 'Experiência apagada.'}), 200
        except Exception as e:
            db.rollback()
            return jsonify({'error': f'Erro interno: {str(e)}'}), 500
        finally:
            db.close()

    # === CRUD: EDUCATION ===
    @app.route('/api/education', methods=['POST'])
    @token_required
    def add_education():
        db: Session = next(get_db())
        data = request.get_json()
        if not all(data.get(k) for k in ['degree', 'institution', 'start_date', 'end_date']):
             return jsonify({'error': 'Campos obrigatórios faltando.'}), 400
        try:
            new_edu = Education(
                degree=data['degree'], 
                institution=data['institution'], 
                start_date=data['start_date'],
                end_date=data['end_date'],
                details=data.get('details', '')
            )
            db.add(new_edu)
            db.commit()
            db.refresh(new_edu)
            return jsonify(dict((col, getattr(new_edu, col)) for col in new_edu.__table__.columns.keys())), 201
        except Exception as e:
            db.rollback()
            return jsonify({'error': f'Erro interno: {str(e)}'}), 500
        finally:
            db.close()


    @app.route('/api/education/<int:edu_id>', methods=['GET', 'OPTIONS'])
    @token_required
    def get_education_item(edu_id):
        db: Session = next(get_db())
        try:
            edu = db.query(Education).filter(Education.id == edu_id).first()
            if not edu: return jsonify({'error': 'Formação não encontrada'}), 404
            return jsonify(dict((col, getattr(edu, col)) for col in edu.__table__.columns.keys())), 200
        finally:
            db.close()


    @app.route('/api/education/<int:edu_id>', methods=['PUT', 'OPTIONS'])
    @token_required
    def update_education(edu_id):
            db: Session = next(get_db())
            data = request.get_json()
            edu = db.query(Education).filter(Education.id == edu_id).first()
            if not edu: return jsonify({'error': 'Formação não encontrada'}), 404
            
            # --- Lógica (start_date/end_date) ---
            if not all(data.get(k) for k in ['degree', 'institution', 'start_date', 'end_date']):
                return jsonify({'error': 'Campos obrigatórios faltando.'}), 400
            try:
                edu.degree = data['degree']
                edu.institution = data['institution']
                edu.start_date = data['start_date']
                edu.end_date = data['end_date']
                edu.details = data.get('details', edu.details)
                
                db.commit()
                db.refresh(edu)
                return jsonify(dict((col, getattr(edu, col)) for col in edu.__table__.columns.keys())), 200
            except Exception as e:
                db.rollback()
                return jsonify({'error': f'Erro interno: {str(e)}'}), 500
            finally:
                db.close()


    @app.route('/api/education/<int:edu_id>', methods=['DELETE', 'OPTIONS'])
    @token_required
    def delete_education(edu_id):
        db: Session = next(get_db())
        try:
            edu = db.query(Education).filter(Education.id == edu_id).first()
            if not edu: return jsonify({'error': 'Formação não encontrada'}), 404
            db.delete(edu)
            db.commit()
            return jsonify({'success': 'Formação apagada.'}), 200
        except Exception as e:
            db.rollback()
            return jsonify({'error': f'Erro interno: {str(e)}'}), 500
        finally:
            db.close()

    # === CRUD: SKILLS ===
    @app.route('/api/skills', methods=['POST'])
    @token_required
    def add_skill():
        db: Session = next(get_db())
        data = request.get_json()
        if not data.get('name'):
             return jsonify({'error': 'O nome da habilidade é obrigatório.'}), 400
        try:
            new_skill = Skill(
                name=data['name'], 
                category=data.get('category', 'Geral')
            )
            db.add(new_skill)
            db.commit()
            db.refresh(new_skill)
            return jsonify(dict((col, getattr(new_skill, col)) for col in new_skill.__table__.columns.keys())), 201
        except Exception as e:
            db.rollback()
            return jsonify({'error': f'Erro interno: {str(e)}'}), 500
        finally:
            db.close()


    @app.route('/api/skills/<int:skill_id>', methods=['GET', 'OPTIONS'])
    @token_required
    def get_skill(skill_id):
        db: Session = next(get_db())
        try:
            skill = db.query(Skill).filter(Skill.id == skill_id).first()
            if not skill: return jsonify({'error': 'Habilidade não encontrada'}), 404
            return jsonify(dict((col, getattr(skill, col)) for col in skill.__table__.columns.keys())), 200
        finally:
            db.close()


    @app.route('/api/skills/<int:skill_id>', methods=['PUT', 'OPTIONS'])
    @token_required
    def update_skill(skill_id):
        db: Session = next(get_db())
        data = request.get_json()
        skill = db.query(Skill).filter(Skill.id == skill_id).first()
        if not skill: return jsonify({'error': 'Habilidade não encontrada'}), 404
        if not data.get('name'):
             return jsonify({'error': 'O nome da habilidade é obrigatório.'}), 400
        try:
            skill.name = data['name']
            skill.category = data.get('category', skill.category)
            db.commit()
            db.refresh(skill)
            return jsonify(dict((col, getattr(skill, col)) for col in skill.__table__.columns.keys())), 200
        except Exception as e:
            db.rollback()
            return jsonify({'error': f'Erro interno: {str(e)}'}), 500
        finally:
            db.close()


    @app.route('/api/skills/<int:skill_id>', methods=['DELETE', 'OPTIONS'])
    @token_required
    def delete_skill(skill_id):
        db: Session = next(get_db())
        try:
            skill = db.query(Skill).filter(Skill.id == skill_id).first()
            if not skill: return jsonify({'error': 'Habilidade não encontrada'}), 404
            db.delete(skill)
            db.commit()
            return jsonify({'success': 'Habilidade apagada.'}), 200
        except Exception as e:
            db.rollback()
            return jsonify({'error': f'Erro interno: {str(e)}'}), 500
        finally:
            db.close()

    # === CRUD: ADDITIONAL INFO ===
    @app.route('/api/additional-info', methods=['POST'])
    @token_required
    def add_additional_info():
        db: Session = next(get_db())
        data = request.get_json()
        if not data or not data.get('text'):
            return jsonify({'error': 'O campo de texto é obrigatório.'}), 400
        try:
            new_item = AdditionalInfo(text=data['text'])
            db.add(new_item)
            db.commit()
            db.refresh(new_item)
            return jsonify(dict((col, getattr(new_item, col)) for col in new_item.__table__.columns.keys())), 201
        except Exception as e:
            db.rollback()
            return jsonify({'error': f'Erro interno: {str(e)}'}), 500
        finally:
            db.close()


    @app.route('/api/additional-info/<int:item_id>', methods=['DELETE', 'OPTIONS'])
    @token_required
    def delete_additional_info(item_id):
        db: Session = next(get_db())
        try:
            item = db.query(AdditionalInfo).filter(AdditionalInfo.id == item_id).first()
            if not item: return jsonify({'error': 'Item não encontrado'}), 404
            db.delete(item)
            db.commit()
            return jsonify({'success': 'Item apagado.'}), 200
        except Exception as e:
            db.rollback()
            return jsonify({'error': f'Erro interno: {str(e)}'}), 500
        finally:
            db.close()
            
    @app.route('/api/additional-info/<int:item_id>', methods=['GET', 'OPTIONS'])
    @token_required
    def get_additional_info_item(item_id):
        db: Session = next(get_db())
        try:
            item = db.query(AdditionalInfo).filter(AdditionalInfo.id == item_id).first()
            if not item: return jsonify({'error': 'Item não encontrado'}), 404
            return jsonify(dict((col, getattr(item, col)) for col in item.__table__.columns.keys())), 200
        finally:
            db.close()
        
    @app.route('/api/additional-info/<int:item_id>', methods=['PUT', 'OPTIONS'])
    @token_required
    def update_additional_info(item_id):
        db: Session = next(get_db())
        data = request.get_json()
        item = db.query(AdditionalInfo).filter(AdditionalInfo.id == item_id).first()
        if not item: return jsonify({'error': 'Item não encontrado'}), 404
        if not data.get('text'): return jsonify({'error': 'O campo de texto é obrigatório.'}), 400
        try:
            item.text = data['text']
            db.commit()
            db.refresh(item)
            return jsonify(dict((col, getattr(item, col)) for col in item.__table__.columns.keys())), 200
        except Exception as e:
            db.rollback()
            return jsonify({'error': f'Erro interno: {str(e)}'}), 500
        finally:
            db.close()


    # =========================================================
    # === ROTAS DE PROJETOS (CRUD ÚNICO) ======================
    # =========================================================
    @app.route('/api/projects', methods=['POST'])
    @token_required
    def add_project():
        db: Session = next(get_db())
        data = request.form
        if not data or not data.get('name') or not data.get('area_saber') or not data.get('materia'):
            return jsonify({'error': 'Campos obrigatórios (nome, area_saber, materia) estão faltando.'}), 400
        try:
            image_url_to_save = None
            if 'image_file' in request.files:
                file_to_upload = request.files['image_file']
                if file_to_upload.filename != '':
                    upload_result = cloudinary.uploader.upload(file_to_upload)
                    image_url_to_save = upload_result.get('secure_url')
            elif 'image_url' in data and data.get('image_url'):
                image_url_to_save = data.get('image_url')
            new_project = Project(
                name=data.get('name'), description=data.get('description', ''), 
                area_saber=data.get('area_saber'), materia=data.get('materia'),
                image_url=image_url_to_save, project_link=data.get('project_link') or None,
                votes=0
            )
            db.add(new_project)
            db.commit()
            db.refresh(new_project) 
            return jsonify(dict((col, getattr(new_project, col)) for col in new_project.__table__.columns.keys())), 201
        except Exception as e:
            db.rollback()
            print(f"Erro ao adicionar projeto: {e}") 
            if hasattr(e, 'message'): return jsonify({'error': f'Erro: {e.message}'}), 500
            return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500
        finally:
            db.close()

    @app.route('/api/projects/<int:project_id>', methods=['GET', 'OPTIONS'])
    @token_required
    def get_project_by_id(project_id):
        if request.method == 'OPTIONS':
            return jsonify({}), 200 
        db: Session = next(get_db())
        try:
            project = db.query(Project).filter(Project.id == project_id).first()
            if not project: 
                return jsonify({'error': 'Projeto não encontrado'}), 404
            project_dict = {c.name: getattr(project, c.name) for c in project.__table__.columns}
            return jsonify(project_dict), 200
        except Exception as e:
            print(f"Erro ao buscar projeto por ID: {e}") 
            return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500
        finally:
            db.close()

    @app.route('/api/projects/<int:project_id>', methods=['PUT', 'OPTIONS'])
    @token_required
    def update_project(project_id):
        if request.method == 'OPTIONS':
            return jsonify({}), 200
        db: Session = next(get_db())
        data = request.form 
        files = request.files 
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            return jsonify({'error': 'Projeto não encontrado'}), 404
        if not data or not data.get('name') or not data.get('area_saber') or not data.get('materia'):
            return jsonify({'error': 'Campos obrigatórios (nome, area_saber, materia) estão faltando.'}), 400
        try:
            image_url_to_save = project.image_url 
            if 'image_file' in files:
                file_to_upload = files['image_file']
                if file_to_upload.filename != '':
                    upload_result = cloudinary.uploader.upload(file_to_upload)
                    image_url_to_save = upload_result.get('secure_url')
            elif 'image_url' in data:
                image_url_to_save = data.get('image_url') or None
            project.name = data.get('name')
            project.description = data.get('description', project.description)
            project.area_saber = data.get('area_saber')
            project.materia = data.get('materia')
            project.project_link = data.get('project_link') or None
            project.image_url = image_url_to_save
            db.commit()
            db.refresh(project)
            project_dict = {c.name: getattr(project, c.name) for c in project.__table__.columns}
            return jsonify(project_dict), 200
        except Exception as e:
            db.rollback()
            print(f"Erro ao atualizar projeto {project_id}: {e}") 
            if hasattr(e, 'message'): return jsonify({'error': f'Erro: {e.message}'}), 500
            return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500
        finally:
            db.close()

    @app.route('/api/projects/<int:project_id>', methods=['DELETE', 'OPTIONS']) 
    @token_required
    def delete_project(project_id):
        if request.method == 'OPTIONS':
            return jsonify({}), 200
        db: Session = next(get_db())
        try:
            project = db.query(Project).filter(Project.id == project_id).first()
            if not project: 
                return jsonify({'error': 'Projeto não encontrado'}), 404
            db.delete(project)
            db.commit()
            return jsonify({'success': 'Projeto apagado com sucesso!'}), 200
        except Exception as e:
            db.rollback() 
            print(f"Erro ao deletar projeto {project_id}: {e}") 
            return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500
        finally:
            db.close()
            
    # === CRUD: HOBBIES ===
    @app.route('/api/hobbies', methods=['GET'])
    def get_hobbies():
        db: Session = next(get_db())
        try:
            hobbies_query = db.query(Hobby).order_by(Hobby.id.asc()).all()
            hobbies_list = []
            for hobby in hobbies_query:
                hobby_dict = {c.name: getattr(hobby, c.name) for c in hobby.__table__.columns}
                hobbies_list.append(hobby_dict)
            return jsonify(hobbies_list)
        except Exception as e:
            print(f"Erro ao buscar hobbies: {e}")
            return jsonify({'error': f'Erro interno do servidor: {e}'}), 500
        finally:
            db.close()

    @app.route('/api/hobbies', methods=['POST'])
    @token_required
    def add_hobby():
        db: Session = next(get_db())
        data = request.form
        if not data or not data.get('title') or not data.get('description'):
            return jsonify({'error': 'Campos obrigatórios (título, descrição) estão faltando.'}), 400
        try:
            image_url_to_save = None
            if 'image_file' in request.files:
                file_to_upload = request.files['image_file']
                if file_to_upload.filename != '':
                    upload_result = cloudinary.uploader.upload(file_to_upload)
                    image_url_to_save = upload_result.get('secure_url')
            elif 'image_url' in data and data.get('image_url'):
                image_url_to_save = data.get('image_url')
            new_hobby = Hobby(
                title=data.get('title'),
                description=data.get('description'),
                image_url=image_url_to_save
            )
            db.add(new_hobby)
            db.commit()
            db.refresh(new_hobby)
            return jsonify(dict((col, getattr(new_hobby, col)) for col in new_hobby.__table__.columns.keys())), 201
        except Exception as e:
            db.rollback()
            print(f"Erro ao adicionar hobby: {e}") 
            if hasattr(e, 'message'): 
                return jsonify({'error': f'Erro: {e.message}'}), 500
            return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500
        finally:
            db.close()

    @app.route('/api/hobbies/<int:hobby_id>', methods=['GET', 'OPTIONS'])
    @token_required
    def get_hobby_by_id(hobby_id):
        db: Session = next(get_db())
        try:
            hobby = db.query(Hobby).filter(Hobby.id == hobby_id).first()
            if hobby is None:
                return jsonify({'error': 'Hobby não encontrado'}), 404
            hobby_dict = {c.name: getattr(hobby, c.name) for c in hobby.__table__.columns}
            return jsonify(hobby_dict), 200
        except Exception as e:
            print(f"Erro ao buscar hobby por ID: {e}")
            return jsonify({'error': f'Erro interno do servidor: {e}'}), 500
        finally:
            db.close()

    @app.route('/api/hobbies/<int:hobby_id>', methods=['PUT', 'OPTIONS'])
    @token_required
    def update_hobby(hobby_id):
        db: Session = next(get_db())
        data = request.form
        if not data or not data.get('title') or not data.get('description'):
            return jsonify({'error': 'Campos obrigatórios (título, descrição) estão faltando.'}), 400
        try:
            hobby = db.query(Hobby).filter(Hobby.id == hobby_id).first()
            if hobby is None:
                return jsonify({'error': 'Hobby não encontrado'}), 404
            image_url_to_save = hobby.image_url 
            if 'image_file' in request.files:
                file_to_upload = request.files['image_file']
                if file_to_upload.filename != '':
                    upload_result = cloudinary.uploader.upload(file_to_upload)
                    image_url_to_save = upload_result.get('secure_url')
            elif 'image_url' in data:
                image_url_to_save = data.get('image_url') or None
            hobby.title = data.get('title')
            hobby.description = data.get('description')
            hobby.image_url = image_url_to_save
            db.commit()
            db.refresh(hobby)
            hobby_dict = {c.name: getattr(hobby, c.name) for c in hobby.__table__.columns}
            return jsonify(hobby_dict), 200
        except Exception as e:
            db.rollback()
            print(f"Erro ao atualizar hobby: {e}")
            if hasattr(e, 'message'): 
                return jsonify({'error': f'Erro: {e.message}'}), 500
            return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500
        finally:
            db.close()

    @app.route('/api/hobbies/<int:hobby_id>', methods=['DELETE', 'OPTIONS'])
    @token_required 
    def delete_hobby(hobby_id):
        db: Session = next(get_db())
        try:
            hobby = db.query(Hobby).filter(Hobby.id == hobby_id).first()
            if hobby is None:
                return jsonify({'error': 'Hobby não encontrado'}), 404
            db.delete(hobby)
            db.commit()
            return jsonify({'success': 'Hobby apagado com sucesso!'}), 200
        except Exception as e:
            db.rollback()
            print(f"Erro ao deletar hobby: {e}")
            return jsonify({'error': f'Erro interno do servidor: {e}'}), 500
        finally:
            db.close()

    # --- Rotas de Admin (Mensagens, Votos, Credenciais) ---
    @app.route('/api/messages', methods=['GET'])
    @token_required 
    def get_messages():
        db: Session = next(get_db())
        try:
            messages_query = db.query(Contact).order_by(Contact.timestamp.desc()).all()
            messages_list = []
            for msg in messages_query:
                msg_dict = {c.name: getattr(msg, c.name) for c in msg.__table__.columns}
                if 'timestamp' in msg_dict and msg_dict['timestamp']:
                    msg_dict['timestamp'] = msg_dict['timestamp'].isoformat()
                else: msg_dict['timestamp'] = None
                messages_list.append(msg_dict)
            return jsonify(messages_list)
        finally:
            db.close()
    
    @app.route('/api/admin/reset-votes', methods=['POST'])
    @token_required 
    def reset_all_votes():
        db: Session = next(get_db())
        try:
            db.query(Project).update({Project.votes: 0})
            db.commit()
            return jsonify({'status': 'success', 'message': 'Todos os votos foram resetados.'})
        except Exception as e:
            db.rollback()
            return jsonify({'status': 'error', 'message': f'Erro ao resetar votos: {e}'}), 500
        finally:
            db.close()

    @app.route('/api/admin/reset-messages', methods=['POST'])
    @token_required 
    def reset_all_messages():
        db: Session = next(get_db())
        try:
            db.query(Contact).delete()
            db.commit()
            return jsonify({'status': 'success', 'message': 'Todas as mensagens foram apagadas.'})
        except Exception as e:
            db.rollback()
            return jsonify({'status': 'error', 'message': f'Erro ao apagar mensagens: {e}'}), 500
        finally:
            db.close()
            
    @app.route('/api/admin/credentials', methods=['PUT', 'OPTIONS'])
    @token_required
    def update_admin_credentials():
            db: Session = next(get_db())
            data = request.get_json()
            current_password = data.get('current_password')
            
            new_username_digitado = data.get('new_username')
            
            new_password = data.get('new_password')
            if not current_password: return jsonify({'error': 'Senha atual é obrigatória para verificação.'}), 400
            
            user_id = g.current_user_id 
            user = db.query(User).filter(User.id == user_id).first()
            if not user: return jsonify({'error': 'Usuário não encontrado'}), 404
            if not user.check_password(current_password): return jsonify({'error': 'Senha atual incorreta.'}), 403
            
            # Normaliza: converte para minúsculas e remove espaços extras
            new_username = new_username_digitado.lower().strip() if new_username_digitado else None
            
            new_password = new_password.strip() if new_password else None
            
            if not new_username and not new_password: return jsonify({'error': 'Você deve fornecer um novo usuário ou uma nova senha.'}), 400
            
            username_is_same = new_username and new_username == user.username
            password_is_same = new_password and user.check_password(new_password)
            
            if username_is_same and password_is_same: return jsonify({'error': 'O novo nome de usuário e a nova senha não podem ser iguais aos atuais.'}), 409
            if username_is_same: return jsonify({'error': 'O novo nome de usuário não pode ser igual ao atual.'}), 409
            if password_is_same: return jsonify({'error': 'A nova senha não pode ser igual à atual.'}), 409
            
            try:
                # Salva o nome de usuário normalizado
                if new_username: user.username = new_username 
                if new_password: user.set_password(new_password)
                
                db.commit()
                return jsonify({'status': 'success', 'message': 'Credenciais atualizadas! Por favor, faça login novamente.'}), 200
            except IntegrityError:
                db.rollback()
                return jsonify({'error': 'Esse nome de usuário já está em uso.'}), 409
            except Exception as e:
                db.rollback()
                return jsonify({'error': f'Erro interno: {e}'}), 500
            finally:
                db.close()