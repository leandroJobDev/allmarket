# 🛒 AllMarket - Ecossistema de Gestão de Notas Fiscais

O **AllMarket** é uma plataforma completa para gestão, validação e organização de compras. Utilizando uma API robusta em **Go (Golang)** com **Clean Architecture**, o sistema transforma URLs de QR Codes da SEFAZ em inteligência de consumo, com persistência em nuvem e uma interface moderna focada no usuário final.

## 📺 Status do Projeto
**Versão 2.0 - Produção 🚀** O sistema está operando com **Google Auth**, frontend reativo em **Tailwind CSS** e backend integrado ao **MongoDB Atlas**.

---

## 🛠️ Tecnologias e Ferramentas

### Backend (Cérebro)
* **Linguagem:** Go (Golang) v1.22+
* **Framework Web:** [Gin Gonic](https://gin-gonic.com/)
* **Persistência:** [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (NoSQL)
* **Scraping:** [GoQuery](https://github.com/PuerkitoBio/goquery) para parsing de dados fiscais (SEFAZ)

### Frontend (Interface)
* **Framework CSS:** [Tailwind CSS](https://tailwindcss.com/) (Design moderno e responsivo)
* **Autenticação:** [Google Identity Services](https://developers.google.com/identity)
* **Componentes:** [SweetAlert2](https://sweetalert2.github.io/) para feedbacks visuais premium

---

## 🏗️ Arquitetura e Organização
O projeto segue os princípios de **Clean Architecture**, garantindo que a lógica de negócio seja independente de frameworks e bancos de dados:

* **`cmd/api/`**: Configuração do servidor e injeção de dependências.
* **`internal/entity/`**: Regras de negócio puras (Modelos de Nota, Itens e Estabelecimento).
* **`internal/usecase/`**: Orquestração do processamento e motores de scraping.
* **`internal/infrastructure/`**: Adaptadores para MongoDB e middlewares de segurança.

---

## 🚀 Funcionalidades de Destaque (UX/UI)

* **Minha Carteira (Sincronizada):** O usuário loga com sua conta Google e tem acesso instantâneo ao seu histórico de compras.
* **Paginação Inteligente:** Renderização otimizada de compras (4 em 4 itens) para manter a performance e fluidez.
* **Filtro de Busca Dinâmico:** Localização instantânea de estabelecimentos ou valores dentro do histórico.
* **Mobile First:** Interface totalmente adaptada para uso em smartphones (estilo extrato bancário).
* **Ancoragem Inteligente:** Ao selecionar uma nota, o sistema realiza um scroll suave diretamente para os detalhes do cupom.
* **Prevenção de Conflitos:** Identificação automática de notas já processadas (Status 409).

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
```text
MONGO_USER=seu_usuario
MONGO_PASS=sua_senha
PORT=8080

```

### 2. Execução

```bash
# Rodar o backend
go run cmd/api/main.go

# O frontend pode ser aberto diretamente (Live Server) ou via navegador.

```

---

## 📈 Próximos Passos

* [ ] Implementação de Dashboards de gastos mensais.
* [ ] Exportação de relatórios em PDF/Excel.
* [ ] Categorização automática de produtos via IA.

```
