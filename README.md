💼 Portfólio de Trabalhos Acadêmicos (Full-Stack)

Este projeto é uma aplicação web completa, responsiva e de pilha dividida (decoupled), servindo como um portfólio pessoal interativo. Ele apresenta trabalhos acadêmicos, um currículo profissional e um painel de controle administrativo seguro para gerenciamento de todo o conteúdo.

🌐 **Site em Produção:** [Acessar Site](https://cadastro-atividades.vercel.app/)  

## ✨ Funcionalidades

### Públicas

  * **🧑‍💻 Apresentação Pessoal: Página inicial com biografia, links diretos para LinkedIn, GitHub e E-mail e direcionamento para a seção "Sobre Mim" com lista de hobbies.
  * **📚 Visualização de Projetos:** Trabalhos organizados por "Áreas do Saber", com cards interativos, com opção de acessar o projeto em outra plataforma e votar no que achar melhor.
* 📄 Página de Currículo: Exibe o currículo e oferece um botão para **download do PDF** (ideal para todos os dispositivos) e um botão de **impressão** (otimizado para uso apenas em computadores).
  * **⭐ Sistema de Votação e Ranking:** Visitantes podem votar nos projetos. Uma página de ranking exibe os mais votados, com destaque para o Top 3.
  * **💬 Formulário de Contato:** Permite o envio direto de mensagens para o administrador.
  * **📱 Design Responsivo:** A interface se adapta a celulares, tablets e desktops.

### Painel de Administrador Seguro

Área protegida por um sistema de autenticação real baseado em Token (JWT). Apenas o administrador pode acessar:

  * **🔐 Login Seguro:** Autenticação via API que retorna um JSON Web Token (JWT) salvo no localStorage.
  * **🖼️ Upload de Imagens:** Integração com Cloudinary para upload da imagem de capa do projeto diretamente pelos formulários de Adicionar/Editar.
  * **➕ Adicionar Projetos:** Formulário para criar novos trabalhos no portfólio.
  * **✏️ Editar Projetos:** Capacidade de alterar qualquer informação de um projeto existente.
  * **🗑️ Deletar Projetos:** Remover projetos do banco de dados.
  * **📨 Visualização de Mensagens:** Acesso a todas as mensagens enviadas pelo formulário de contato.
  * **🔑 Alterar Credenciais:** O administrador pode alterar seu próprio nome de usuário e senha de forma segura.
  * **☢️ Zona de Perigo:** Ferramentas para resetar todos os votos ou apagar todas as mensagens, com confirmação.
  * **💡 Nota sobre Registro de Usuário:** Você notará que o site possui uma tela de "Login" protegida, mas não uma tela de "Registro". Isso é intencional.
    Este projeto foi desenhado como um portfólio de usuário único (single-user), onde apenas o proprietário (administrador) pode gerenciar o conteúdo. A conta de administrador não é criada publicamente; ela é criada de forma segura no lado do servidor (backend) através de um comando CLI (flask create-admin), garantindo que ninguém mais possa se registrar ou modificar o portfólio.

-----

## 📖 Manual de Uso

Este manual descreve como interagir com a aplicação, tanto do ponto de vista de um visitante público quanto do administrador do conteúdo.

### 👤 Para Visitantes

Qualquer pessoa que acessa o site pode:

* **Explorar a Home:** Ver a apresentação pessoal, biografia,  se direcionar a seção "Sobre Mim", descobrir hobbies e acessar links diretos para LinkedIn, GitHub e E-mail.
* **Visualizar Projetos:** Navegar pelos trabalhos acadêmicos, que são organizados por "Áreas do Saber".
* **Interagir com Projetos:**
    * Clicar em um card para ver detalhes.
    * Acessar o link externo do projeto (se houver).
    * Votar em um projeto para demonstrar seu apoio.
* **Ver o Ranking:** Acessar a página de ranking para ver os projetos mais votados, com um destaque especial para o Top 3.
* **Acessar o Currículo:**
    * Visualizar o currículo profissional online.
    * Baixar uma versão em PDF otimizada para qualquer dispositivo.
    * Usar o botão de "Impressão" (otimizado para computadores) para imprimir o currículo.
* **Entrar em Contato:** Utilizar o formulário de contato para enviar uma mensagem diretamente ao administrador.

### 👑 Para o Administrador (Proprietário)

O administrador possui controle total sobre o conteúdo do portfólio através de um painel seguro.

#### Acesso e Autenticação

1.  **Acesso ao Painel:** Navegue até a rota de login do site.
2.  **Login Seguro:** Insira o nome de usuário e senha (definidos via backend com o comando `flask create-admin`).
3.  **Token JWT:** Após o login bem-sucedido, a API retorna um JSON Web Token (JWT), que é salvo no `localStorage` do navegador para autenticar todas as requisições futuras.

#### Gerenciamento de Conteúdo

Uma vez logado, o administrador tem acesso ao Painel de Controle, onde pode:

* **Gerenciar Conteúdo Pessoal:** Criar, editar ou deletar os textos da seção "Sobre Mim", a lista de "Hobbies" e as informações do "Currículo" que são exibidas no site.
* **Gerenciar Projetos:**
    * **Adicionar Projetos:** Preencher o formulário para adicionar um novo trabalho, incluindo o upload direto da imagem de capa para o Cloudinary.
    * **Editar Projetos:** Modificar qualquer informação de um projeto já existente.
    * **Deletar Projetos:** Remover permanentemente um projeto do banco de dados.
* **Gerenciar Interações:**
    * **Visualizar Mensagens:** Ler todas as mensagens enviadas pelos visitantes através do formulário de contato.
* **Gerenciar Conta:**
    * **Alterar Credenciais:** Mudar com segurança o nome de usuário e a senha da conta de administrador.

#### Ferramentas de Manutenção (Zona de Perigo)

O painel inclui uma "Zona de Perigo" para ações destrutivas que exigem confirmação:

* **Resetar Votos:** Zerar a contagem de votos de todos os projetos.
* **Apagar Mensagens:** Limpar permanentemente todas as mensagens recebidas.

-----

## 🏗️ Arquitetura de Produção

Este projeto utiliza uma arquitetura de pilha dividida (decoupled), onde o Frontend e o Backend são aplicações completamente separadas e hospedadas em plataformas otimizadas para suas respectivas tecnologias.

```
┌───────────────────┐            ┌───────────────────┐          ┌──────────────────┐
│     VERCEL        │            │      RENDER       │          │      NEON        │
│   (Frontend)      │            │    (Backend)      │          │   (Database)     │
│     React         │ ──API──>   │   Python / Flask  │ ──SQL──> │   PostgreSQL     │
│ (cadastro-...)    │ Calls      │    (gunicorn)     │ Calls    │   (Serverless)   │
└───────────────────┘            └───────────────────┘          └──────────────────┘
```

-----

## 🛠️ Tecnologias Utilizadas

### 🖥️ Frontend

  * **Framework:** React
  * **Roteamento:** React Router
  * **Cliente HTTP:** Axios (configurado com baseURL para produção e desenvolvimento)
  * **Ícones:** React Icons
  * **Autenticação:** Armazenamento de Token JWT em localStorage.
  * **Hospedagem:** Vercel

### ⚙️ Backend

  * **Linguagem:** Python
  * **Framework:** Flask (para a API REST)
  * **Servidor WSGI:** Gunicorn (para produção no Render)
  * **ORM:** SQLAlchemy (para interagir com o banco de dados)
  * **Autenticação:** PyJWT (para criar e verificar tokens)
  * **Database Driver:** Psycopg2 (para conectar ao PostgreSQL)
  * **Armazenamento de Mídia:** Cloudinary (para hospedagem das imagens dos projetos)
  * **Variáveis de Ambiente:** python-dotenv
  * **Hospedagem:** Render

### 💾 Banco de Dados

  * **Serviço:** Neon
  * **Tipo:** PostgreSQL (Serverless)

-----

## 💻 Desenvolvimento Local

Para rodar o projeto em sua máquina, você precisará de 2 terminais abertos. A aplicação local se conectará ao mesmo banco de dados Neon da nuvem.

### 🔧 Pré-requisitos

  * Node.js (v18 ou superior)
  * Python (v3.11 recomendado)
  * Uma conta no Neon para o banco de dados.
  * Uma conta no Cloudinary para hospedagem de imagens.

-----

### 📦 Instalação

#### Clone o Repositório

```bash
git clone https://github.com/Fernando-Accacio/cadastro-atividades.git
cd cadastro-atividades
```

-----

### Configure as Variáveis de Ambiente (Backend)

Crie um arquivo `.env` na raiz do projeto (`cadastro-atividades/.env`). Adicione as chaves que você configurou no Render:

```
# Do seu banco de dados Neon
DATABASE_URL=postgresql://USUARIO:SENHA@HOST/DATABASE?sslmode=require

# Chave secreta para o Flask (pode ser qualquer string aleatória)
JWT_SECRET_KEY=sua_chave_secreta_aqui_bem_longa_e_aleatoria

# Senha padrão para o primeiro admin (será usada no comando 'flask create-admin')
ADMIN_PASSWORD=senha_forte_para_o_admin

# Diz ao Flask onde encontrar a aplicação
FLASK_APP=api

# Chaves da API do Cloudinary (para upload de imagens)
CLOUDINARY_CLOUD_NAME=seu_cloud_name_aqui
CLOUDINARY_API_KEY=sua_api_key_aqui
CLOUDINARY_API_SECRET=sua_api_secret_aqui
```

-----

### Configure as Variáveis de Ambiente (Frontend)

Crie outro arquivo `.env` dentro da pasta `frontend` (`cadastro-atividades/frontend/.env`):

```
# Diz ao React para se conectar à sua API local
REACT_APP_API_URL=http://127.0.0.1:5000
```

-----

## 🚀 Rodando o Projeto

### Terminal 1 - Backend (Flask)

```bash
py -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
flask init-db
flask create-admin seu-nome-de-usuario
flask run
```

✅ Backend rodando em: `http://127.0.0.1:5000`

-----

### Terminal 2 - Frontend (React)

```bash
cd frontend
npm install
npm start
```

✅ Frontend abrindo em: `http://localhost:3000`

> O `axiosConfig.js` do frontend lerá automaticamente a variável do `frontend/.env` e se conectará ao seu backend local.

-----

### 🚀 Rodando o Projeto (após a primeira configuração)

Se você já executou tudo uma vez (criou ambiente virtual, instalou dependências, inicializou o banco e criou o admin), a rotina diária é muito mais simples:

**Terminal 1 - Backend (Flask)**

```bash
# Ativar o ambiente virtual
cd cadastro-atividades
# Windows
.\venv\Scripts\activate
# source venv/bin/activate # Linux/Mac

# Rodar o backend
flask run
```

✅ Backend disponível em: `http://127.0.0.1:5000`

**Terminal 2 - Frontend (React)**

```bash
cd cadastro-atividades/frontend

# Rodar o frontend
npm start
```

✅ Frontend disponível em: `http://localhost:3000`

-----

## 📁 Estrutura do Projeto

```
cadastro-atividades/
├── .env              # Variáveis de ambiente do Backend (local)
├── .gitignore
├── requirements.txt  # Dependências Python (para Render e local)
├── vercel.json       # Configuração de deploy do Frontend na Vercel
├── venv/             # Ambiente virtual Python
│
├── api/              # CÓDIGO DO BACKEND (PYTHON/FLASK)
│   ├── __init__.py   # Inicialização da aplicação Flask
│   ├── database.py   # Comandos (init-db, create-admin)
│   ├── models.py     # Modelos de dados (SQLAlchemy)
│   └── routes.py     # Todas as rotas da API (/api/...)
│
└── frontend/         # CÓDIGO DO FRONTEND (REACT)
    ├── .env          # Variáveis de ambiente do Frontend (local)
    ├── build/        # Build de produção (ignorado pelo Git)
    ├── node_modules/ # Dependências Node.js (ignorado pelo Git)
    ├── public/
    │   ├── documents/  # PDF do currículo
    │   ├── images/     # Imagens estáticas (logo, etc.)
    │   └── index.html
    │
    ├── src/
    │   ├── api/
    │   │   └── axiosConfig.js # Configuração central do Axios (lê .env)
    │   │
    │   ├── components/      # Componentes reutilizáveis (Header, Footer, Card)
    │   │
    │   ├── pages/           # Páginas principais do site
    │   │   ├── AdminPage.js
    │   │   ├── AddProjectPage.js
    │   │   ├── EditProjectPage.js
    │   │   ├── HomePage.js
    │   │   └── ...
    │   │
    │   ├── App.js         # Roteador principal (React Router)
    │   ├── App.css
    │   └── index.js
    │
    └── package.json

Este repositório inclui a pasta screenshots/, contendo imagens de exemplo do site em funcionamento, e o arquivo schema.sql, que contém a exportação completa do banco de dados (estrutura e dados) para importação e teste local.