-- --------------------------------------------------------
-- Servidor:                     ep-icy-forest-acnj7ii7-pooler.sa-east-1.aws.neon.tech
-- Versão do servidor:           PostgreSQL 17.5 (aa1f746) on x86_64-pc-linux-gnu, compiled by gcc (Debian 12.2.0-14+deb12u1) 12.2.0, 64-bit
-- OS do Servidor:               
-- HeidiSQL Versão:              12.10.0.7000
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES  */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Copiando estrutura para tabela public.additional_info
CREATE TABLE IF NOT EXISTS "additional_info" (
	"id" SERIAL NOT NULL,
	"text" TEXT NOT NULL,
	PRIMARY KEY ("id"),
	KEY ("id")
);

-- Copiando dados para a tabela public.additional_info: -1 rows
/*!40000 ALTER TABLE "additional_info" DISABLE KEYS */;
INSERT INTO "additional_info" ("id", "text") VALUES
	(1, 'Curso Complementar
Gestão de Ameaças Cibernéticas - Senac
(Conhecimentos sobre segurança digital, identificação de vulnerabilidades e prevenção de ataques cibernéticos)');
/*!40000 ALTER TABLE "additional_info" ENABLE KEYS */;

-- Copiando estrutura para tabela public.contacts
CREATE TABLE IF NOT EXISTS "contacts" (
	"id" SERIAL NOT NULL,
	"name" VARCHAR NOT NULL,
	"email" VARCHAR NOT NULL,
	"message" TEXT NOT NULL,
	"timestamp" TIMESTAMPTZ NULL DEFAULT now(),
	PRIMARY KEY ("id"),
	KEY ("id")
);

-- Copiando dados para a tabela public.contacts: -1 rows
/*!40000 ALTER TABLE "contacts" DISABLE KEYS */;
INSERT INTO "contacts" ("id", "name", "email", "message", "timestamp") VALUES
	(4, 'a', 'aaaaaaaaaaaaa@gmail.com', 'aa', '2025-11-05 02:34:17.47143+00');
/*!40000 ALTER TABLE "contacts" ENABLE KEYS */;

-- Copiando estrutura para tabela public.education
CREATE TABLE IF NOT EXISTS "education" (
	"id" SERIAL NOT NULL,
	"degree" VARCHAR NOT NULL,
	"institution" VARCHAR NOT NULL,
	"details" TEXT NULL DEFAULT NULL,
	"start_date" VARCHAR NOT NULL,
	"end_date" VARCHAR NOT NULL,
	PRIMARY KEY ("id"),
	KEY ("id")
);

-- Copiando dados para a tabela public.education: -1 rows
/*!40000 ALTER TABLE "education" DISABLE KEYS */;
INSERT INTO "education" ("id", "degree", "institution", "details", "start_date", "end_date") VALUES
	(2, 'Ensino Médio Técnico em Internet das Coisas (IoT)', 'Senac Nações Unidas', 'Top 5 melhor projeto confeccionado no Empreenda Senac do Senac Santo Amaro, demonstrando espírito empreendedor, criatividade e capacidade de
trabalho em equipe.', '02/2023', '12/2025');
/*!40000 ALTER TABLE "education" ENABLE KEYS */;

-- Copiando estrutura para tabela public.experiences
CREATE TABLE IF NOT EXISTS "experiences" (
	"id" SERIAL NOT NULL,
	"title" VARCHAR NOT NULL,
	"company" VARCHAR NOT NULL,
	"start_date" VARCHAR NOT NULL,
	"end_date" VARCHAR NULL DEFAULT NULL,
	"description" TEXT NULL DEFAULT NULL,
	PRIMARY KEY ("id"),
	KEY ("id")
);

-- Copiando dados para a tabela public.experiences: -1 rows
/*!40000 ALTER TABLE "experiences" DISABLE KEYS */;
/*!40000 ALTER TABLE "experiences" ENABLE KEYS */;

-- Copiando estrutura para tabela public.general_info
CREATE TABLE IF NOT EXISTS "general_info" (
	"id" SERIAL NOT NULL,
	"main_name" VARCHAR NULL DEFAULT NULL,
	"full_name" VARCHAR NULL DEFAULT NULL,
	"address" VARCHAR NULL DEFAULT NULL,
	"phone" VARCHAR NULL DEFAULT NULL,
	"email" VARCHAR NULL DEFAULT NULL,
	"responsible" VARCHAR NULL DEFAULT NULL,
	"profile_pic_url" VARCHAR NULL DEFAULT NULL,
	"pdf_url" VARCHAR NULL DEFAULT NULL,
	"objective" TEXT NULL DEFAULT NULL,
	"resume_summary" TEXT NULL DEFAULT NULL,
	"informal_intro" TEXT NULL DEFAULT NULL,
	"experience_fallback_text" TEXT NULL DEFAULT NULL,
	"show_education" BOOLEAN NOT NULL DEFAULT true,
	"show_skills" BOOLEAN NOT NULL DEFAULT true,
	"show_additional_info" BOOLEAN NOT NULL DEFAULT true,
	"linkedin_url" VARCHAR NULL DEFAULT NULL,
	"github_url" VARCHAR NULL DEFAULT NULL,
	"email_address" VARCHAR NULL DEFAULT NULL,
	"show_linkedin" BOOLEAN NULL DEFAULT true,
	"show_github" BOOLEAN NULL DEFAULT true,
	"show_email" BOOLEAN NULL DEFAULT true,
	PRIMARY KEY ("id"),
	KEY ("id")
);

-- Copiando dados para a tabela public.general_info: -1 rows
/*!40000 ALTER TABLE "general_info" DISABLE KEYS */;
INSERT INTO "general_info" ("id", "main_name", "full_name", "address", "phone", "email", "responsible", "profile_pic_url", "pdf_url", "objective", "resume_summary", "informal_intro", "experience_fallback_text", "show_education", "show_skills", "show_additional_info", "linkedin_url", "github_url", "email_address", "show_linkedin", "show_github", "show_email") VALUES
	(1,
'Diogo Oliveira',
'Diogo Lopes de Oliveira',
'São Paulo, SP',
'11 96395-0408',
'diogo.olveira8178@gmail.com',
'Gabriela Ramos Lopes',
'file:///C:/Users/diogo_q/Documents/FRONT%20END%20-%20IOT/cadastro-atividades-main/screenshots/foto_diogo.webp',
'file:///C:/Users/diogo_q/Documents/Curr%C3%ADculo%201.pdf',
'Trabalhar com o que gosto.',
'Estudante de IoT e desenvolvedor de jogos na Sagui Games.',
'Olá! Sou o Diogo Oliviera, fundador da Sagui Games e apaixonado por tecnologia, gosto de áreas audiovisuais e de desenvolvimento criativo.',
'Ainda em busca da primeira experiência profissional.',
'true', 'true', 'true',
'www.linkedin.com/in/diogo-oliveira-726044235',
'https://github.com/oliveira3839',
'diogo.oliveira8178@gmail.com',
'true', 'true', 'true');

/*!40000 ALTER TABLE "general_info" ENABLE KEYS */;

-- Copiando estrutura para tabela public.hobbies
CREATE TABLE IF NOT EXISTS "hobbies" (
	"id" SERIAL NOT NULL,
	"title" VARCHAR NOT NULL,
	"description" TEXT NOT NULL,
	"image_url" VARCHAR NULL DEFAULT NULL,
	PRIMARY KEY ("id"),
	KEY ("id")
);

-- Copiando dados para a tabela public.hobbies: -1 rows
/*!40000 ALTER TABLE "hobbies" DISABLE KEYS */;
INSERT INTO "hobbies" ("id", "title", "description", "image_url") VALUES
(10, 'Jogos — Muito Além de um Hobby', 'Os jogos representam um papel extremamente importante na minha vida. Muito mais do que diversão, eles me ajudaram a me formar como pessoa e me ensinaram valores e lições que muitas vezes eu não tive acesso na infância. Através das narrativas, personagens e histórias, aprendi sobre empatia, coragem, escolhas e consequências.

Eu jogo desde os meus 5 ou 6 anos de idade. Esse contato veio muito cedo, principalmente porque meu pai já tinha videogame em casa, e eu também jogava bastante com meus primos. Um dos momentos mais marcantes da minha vida com os jogos foi jogar ao lado do meu primo Luis Felipe, que considero o irmão que nunca tive. Crescemos juntos jogando, vivenciando histórias incríveis e criando memórias que levarei comigo para sempre.

Os jogos de história, principalmente, foram fundamentais para moldar quem eu sou hoje. Eles me ensinaram a enxergar o mundo com outros olhos e despertaram em mim não só o amor por jogar, mas também o sonho de criar meus próprios jogos e contar minhas próprias histórias.', 
'https://t.ctcdn.com.br/VERupnDup0MGzQDv6z5SGlAwcS4=/900x675/smart/i458286.png'),

(12, 'Minha Mãe, Gabriela Lopes, e Meu Avô, Francisco Oliveira', 'Minha mãe, Gabriela Lopes, é a pessoa mais próxima de mim e a base de tudo na minha vida. Moramos juntos e cuidamos um do outro diariamente, enfrentando juntos as dificuldades que surgem no nosso dia a dia, principalmente pelas limitações da nossa realidade social. Ela sempre esteve ao meu lado, me apoiando tanto emocionalmente quanto financeiramente. Como mãe solo, ela luta todos os dias para me sustentar, e isso é algo que eu admiro profundamente.

Meu maior objetivo de vida é, no futuro, poder retribuir tudo o que ela fez por mim e ajudá-la como ela sempre me ajudou. A força, a resistência e a coragem dela são inspirações constantes para mim.

Meu avô, Francisco Oliveira, que infelizmente faleceu há três anos, também teve um papel fundamental na minha formação. Foi ele quem construiu a nossa moradia e quem me ensinou muitos dos valores que carrego hoje. Ele me ensinou sobre responsabilidade, caráter e sobre os valores que um homem deve ter, principalmente vindo de uma realidade de classe social baixa. Mesmo após sua partida, seu ensinamento permanece vivo em mim todos os dias.', 
'https://photos.fife.usercontent.google.com/pw/AP1GczM-DVM9NfGO_p-wz9dOUzFdGFqxvSrs_s7YoKaqx-Xji0KJHdutc1As1g=w844-h633-s-no-gm?authuser=0'),

(8, 'Maíra da Silva — Minha Parte Amorosa', 'A Maíra faz parte da minha vida desde o início de 2024, quando nossa amizade começou. Em março desse mesmo ano, nossa relação se tornou amorosa, e desde maio somos oficialmente namorados. Ela representa toda a minha parte amorosa e afetiva — eu sou uma pessoa muito carinhosa e intensa emocionalmente, e nela encontrei alguém que me entende e me acolhe.

Vivemos realidades bastante diferentes, principalmente em relação à classe social e à presença familiar, mas mesmo assim escolhemos ficar juntos e construir algo verdadeiro. Planejamos, se tudo der certo, morar juntos e formar uma família no futuro. Nosso relacionamento é feito de carinho, diálogo, apoio e muita vontade de vencer juntos.', 
'https://photos.fife.usercontent.google.com/pw/AP1GczPGQbQeHeC1PUeU3Xki70bI1HhdL62XqrBvkPdsv_qnbNF9fomGbWChSw=w475-h633-s-no-gm?authuser=0'),

(9, 'Luis Felipe — O Irmão que a Vida Me Deu', 'O Luis Felipe é meu primo materno, praticamente da mesma idade que eu, e nós crescemos juntos desde bebês. Ele é, sem dúvida, o irmão que nunca tive. Vivemos lado a lado todas as fases da infância, o início da internet, dos jogos e de tudo o que moldou a nossa geração.

Hoje temos gostos muito parecidos e uma conexão que vai muito além do laço de sangue. Ele é extremamente importante para mim, porque sempre esteve presente nos momentos bons e ruins da vida. Nossa relação é de parceria, amizade, irmandade e apoio mútuo.', 
'https://photos.fife.usercontent.google.com/pw/AP1GczOHwWy3oQmRm2C97gqTMvSE-sL765R26N8UhnfayXBxgT5dk8xlxzkSVA=w844-h633-s-no-gm?authuser=0'),

(11, 'Meu Pai, Thiago Batista dos Santos Oliveira', 'Meu pai, Thiago Batista dos Santos Oliveira, deixou de morar comigo e com minha mãe há alguns anos, mas até hoje mantemos contato diário. Ele mora próximo a nós e continua tendo uma boa relação com minha mãe. Quando morávamos juntos, ele foi essencial para a formação dos meus gostos pessoais.

Foi com ele que aprendi a gostar de filmes, músicas e jogos, especialmente aqueles com boas histórias, trilhas épicas e narrativas marcantes. Até hoje compartilhamos o gosto por rock, por games de história e por viagens. Ele trabalha na área de turismo, e isso também influenciou meu gosto por conhecer novos lugares e culturas.

Mesmo com a distância física, ele continua sendo uma presença importante na minha vida.', 
'https://photos.google.com/search/Cg5EaW9nbyBPbGl2ZWlyYRopCidBRjFRaXBOeTNDckZSRkw1anlXeXpTbl9CNndkSDNydW9sSHA2VzQiMRIvCi0KKwopEidBRjFRaXBOeTNDckZSRkw1anlXeXpTbl9CNndkSDNydW9sSHA2VzQovbfKl6wz/photo/AF1QipNzaATxVVJ4QosdEyJT4qlkHP9_asxAaIQsYqks'),

(13, 'Sagui Games — Onde Meus Sonhos Ganharam Forma', 'A Sagui Games é muito mais do que uma empresa para mim — ela representa um sonho que nasceu do meu amor pelos jogos e pela tecnologia. É através dela que eu transformo ideias em projetos, histórias em experiências interativas e criatividade em algo concreto.

Desenvolver jogos me faz sentir vivo, me desafia, me ensina e me motiva a evoluir todos os dias. Cada linha de código, cada personagem criado e cada mecânica pensada carrega um pedaço da minha história e do que aprendi com os jogos desde a infância. A Sagui Games não é apenas um hobby técnico; é uma parte do meu futuro profissional e pessoal.', 
'https://img.itch.zone/aW1nLzIxNDc5MTUzLnBuZw==/315x250%23c/B4159T.png'),

(14, 'Fufy, Paçoca, Peludo e Colette — Minha Família de Quatro Patas', 'Tenho três cachorros e uma ratinha que são extremamente importantes para mim: Fufy, Paçoca, Peludo e Colette. A Fufy é minha companheira mais antiga, acabou de completar 11 anos no dia 21/11/2025. Ela está comigo desde a minha infância, e eu costumo dizer que sou o humano dela. O Paçoca é filho da Fufy e tem 9 anos, enquanto o Peludo já é bem idoso e está com minha mãe desde antes mesmo de eu nascer.

A Colette é a mais recente da família, uma ratinha twister que adotei há pouco tempo. Ela ainda é jovem, mas já conquistou completamente meu coração. Amo todos eles profundamente. Cada um, do seu jeitinho, faz parte da minha vida e da minha rotina, trazendo carinho, companhia e amor todos os dias.', 
'https://photos.fife.usercontent.google.com/pw/AP1GczP_psNitjpNNIx8sTECJJZoderaYn1Pk9zF4m4rXvDh7fHsSkNhzmXuCg=w475-h633-s-no-gm?authuser=0');


-- Copiando estrutura para tabela public.projects
CREATE TABLE IF NOT EXISTS "projects" (
	"id" SERIAL NOT NULL,
	"name" VARCHAR NOT NULL,
	"description" TEXT NOT NULL,
	"area_saber" VARCHAR NOT NULL,
	"materia" VARCHAR NOT NULL,
	"image_url" VARCHAR NULL DEFAULT NULL,
	"project_link" VARCHAR NULL DEFAULT NULL,
	"votes" INTEGER NOT NULL,
	PRIMARY KEY ("id"),
	KEY ("id")
);

-- Copiando dados para a tabela public.projects: -1 rows
/*!40000 ALTER TABLE "projects" DISABLE KEYS */;
INSERT INTO "projects" ("id", "name", "description", "area_saber", "materia", "image_url", "project_link", "votes") VALUES
	(1, 'boa', 'TESTE', 'TESTE', 'TESTE', 'https://res.cloudinary.com/dax5ezkth/image/upload/v1762300876/ugxxplyozsyt9ltwik5t.png', 'https://github.com/', 12);
/*!40000 ALTER TABLE "projects" ENABLE KEYS */;

-- Copiando estrutura para tabela public.skills
CREATE TABLE IF NOT EXISTS "skills" (
	"id" SERIAL NOT NULL,
	"name" VARCHAR NOT NULL,
	"category" VARCHAR NULL DEFAULT NULL,
	PRIMARY KEY ("id"),
	KEY ("id")
);

-- Copiando dados para a tabela public.skills: -1 rows
/*!40000 ALTER TABLE "skills" DISABLE KEYS */;
INSERT INTO "skills" ("id", "name", "category") VALUES
	(3, 'Conhecimentos em Internet das Coisas (IoT) e tecnologias emergentes.', 'Técnica'),
	(4, 'Noções de redes, sensores e conectividade de dispositivos inteligentes.', 'Técnica'),
	(5, 'Habilidade em resolução de problemas, lógica e raciocínio analítico.', 'Técnica'),
	(6, 'Capacidade de organização e responsabilidade com prazos e metas.', 'Técnica'),
	(7, 'Facilidade para aprender e absorver novas informações rapidamente.', 'Soft Skill'),
	(8, 'Colaboração e trabalho em equipe, prezando sempre pelo respeito e boa comunicação.', 'Soft Skill'),
	(9, 'Proatividade e comprometimento em todas as tarefas atribuídas.', 'Soft Skill'),
	(10, 'Grande interesse em tecnologia, inovação e segurança da informação.', 'Soft Skill'),
	(11, 'Dedicação em dar o melhor desempenho possível em cada desafio.', 'Soft Skill'),
	(12, 'Disponibilidade para aprender, colaborar e crescer dentro da empresa.', 'Soft Skill'),
	(13, 'Perfil dinâmico, curioso e com forte interesse em tecnologia e inovação.', 'Soft Skill'),
	(14, 'Aberto a novos desafios e sempre disposto a evoluir profissionalmente.', 'Soft Skill'),
	(15, 'Português Nativo e Inglês Avançado', 'Idioma');
/*!40000 ALTER TABLE "skills" ENABLE KEYS */;

-- Copiando estrutura para tabela public.users
CREATE TABLE IF NOT EXISTS "users" (
	"id" SERIAL NOT NULL,
	"username" VARCHAR NOT NULL,
	"password_hash" VARCHAR NOT NULL,
	PRIMARY KEY ("id"),
	UNIQUE ("username"),
	KEY ("id")
);

-- Copiando dados para a tabela public.users: -1 rows
/*!40000 ALTER TABLE "users" DISABLE KEYS */;
INSERT INTO "users" ("id", "username", "password_hash") VALUES
	(1, 'diogo oliveira', 'scrypt:32768:8:1$t8Qemf8HXXR3JIWn$1a1d82fbd5959a93f697594a51abd8973c6779e4eb726c75c9d6dc1f6aa295f1db74663e84c6a3cce2fe214e10ab1a177cb45f9506ae39342da4656e04cc3a7f');
/*!40000 ALTER TABLE "users" ENABLE KEYS */;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;