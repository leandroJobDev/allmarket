# 🛒 AllMarket - Ecossistema de Gestão de Notas Fiscais

O **AllMarket** é uma plataforma completa para gestão, validação e organização de compras. Utilizando uma API robusta em **Go (Golang)** com **Clean Architecture**, o sistema transforma URLs de QR Codes da SEFAZ em inteligência de consumo, com persistência em nuvem e uma interface moderna focada no usuário final.

---

## 📺 Status do Projeto
**Versão 2.0 - Produção 🚀** O sistema está operando com **Google Auth**, frontend reativo em **Tailwind CSS** e backend integrado ao **MongoDB Atlas**.

---

## 🛠️ Tecnologias e Ferramentas

### Backend (Cérebro)
* **Linguagem:** Go (Golang) v1.22+
* **Framework Web:** Gin Gonic
* **Persistência:** MongoDB Atlas (NoSQL)
* **Scraping:** GoQuery para parsing de dados fiscais (SEFAZ)

### Frontend (Interface)
* **Framework CSS:** Tailwind CSS (Design moderno e responsivo)
* **Autenticação:** Google Identity Services
* **Componentes:** SweetAlert2 para feedbacks visuais premium

---

## 🏗️ Arquitetura e Organização

O projeto segue os princípios de **Clean Architecture**, garantindo que a lógica de negócio seja independente de frameworks e bancos de dados:

* `cmd/api/`: Configuração do servidor e injeção de dependências.
* `internal/entity/`: Regras de negócio puras (Modelos de Nota, Itens e Estabelecimento).
* `internal/usecase/`: Orquestração do processamento e motores de scraping.
* `internal/infrastructure/`: Adaptadores para MongoDB e middlewares de segurança.

---

## 🚀 Funcionalidades de Destaque (UX/UI)

* **Minha Carteira (Sincronizada):** O usuário loga com sua conta Google e tem acesso instantâneo ao seu histórico de compras.
* **Paginação Inteligente:** Renderização otimizada de compras para manter a performance e fluidez.
* **Filtro de Busca Dinâmico:** Localização instantânea de estabelecimentos ou valores dentro do histórico.
* **Mobile First:** Interface totalmente adaptada para smartphones com o conceito: **Extrair. Escanear. Economizar.**
* **Ancoragem Inteligente:** Scroll suave diretamente para os detalhes do cupom selecionado.
* **Prevenção de Conflitos:** Identificação automática de notas já processadas (Idempotência).

---

## 📂 Estrutura de Rotas API

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `GET` | `/` | Health Check / Status da API |
| `POST` | `/processar` | Extrai e salva dados de uma nova URL de nota |
| `GET` | `/historico` | Recupera todas as notas vinculadas a um e-mail |

---

## 🧪 Como Rodar o Projeto

### 1. Configuração do Ambiente
Crie um arquivo `.env` na raiz do projeto:
```env
MONGO_USER=seu_usuario
MONGO_PASS=sua_senha
PORT=8080

```

### 2. Execução

```bash
# Rodar o backend
go run cmd/api/main.go

```

*O frontend pode ser aberto diretamente via Live Server ou qualquer servidor estático.*

---

## 📈 Roadmap de Evolução

* **Analytics & BI:** Implementação de dashboards interativos com gráficos de gastos e comparadores de preços históricos.
* **Smart Shopping List:** Geração automatizada de listas de compras baseada nos produtos já cadastrados no banco.
* **IA Engine:** Integração com inteligência artificial para analisar preços em sites de varejo e encartes digitais.
* **Exportação Pro:** Geração de relatórios consolidados em PDF e planilhas (Excel/CSV).

---

Desenvolvido com foco em **Excelência Arquitetural** e **Design Resiliente**.

```

```
