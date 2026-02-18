```markdown
# 🛒 AllMarket - Sistema de Gestão de Compras

O **AllMarket** é uma API robusta desenvolvida em **Go (Golang)**, projetada para gerenciar, validar e extrair dados de compras a partir de notas fiscais eletrônicas (NFC-e). O projeto utiliza **Clean Architecture** e conta com persistência em nuvem (NoSQL) e deploy automatizado.

## 📺 Status do Projeto
**MVP Funcional - Produção 🚀** A API está hospedada na **Render** e conectada ao **MongoDB Atlas**, processando e armazenando dados reais com alta performance.

---

## 🛠️ Tecnologias e Ferramentas

* **Linguagem:** Go (Golang) v1.22+
* **Framework Web:** [Gin Gonic](https://gin-gonic.com/) (Roteamento de alta performance)
* **Banco de Dados:** [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Persistência NoSQL em nuvem)
* **Web Scraping:** [GoQuery](https://github.com/PuerkitoBio/goquery) para parsing de dados da SEFAZ
* **Frontend:** HTML5, CSS3 (Bootstrap 5) e JavaScript (Fetch API)
* **Deploy/Hospedagem:** [Render](https://render.com/)
* **Segurança:** [Godotenv](https://github.com/joho/godotenv) para gestão de variáveis de ambiente

---

## 🏗️ Estrutura do Projeto (Clean Architecture)

O projeto é dividido em camadas independentes para facilitar testes e manutenção:

* **`cmd/api/`**: Ponto de entrada da aplicação. Configura o servidor, carrega variáveis de ambiente e define as rotas.
* **`internal/entity/`**: Modelos de domínio (`NotaFiscal`, `Item`, `Estabelecimento`) e regras de negócio essenciais.
* **`internal/usecase/`**: Regras de aplicação. Contém os scrapers especializados e a lógica de orquestração do processamento.
* **`internal/infrastructure/`**: Adaptadores para serviços externos, como a implementação do repositório **MongoDB**.

---

## 🚀 Funcionalidades Implementadas

* **Persistência em Nuvem:** Armazenamento automático de notas fiscais no MongoDB Atlas.
* **Prevenção de Duplicidade:** O sistema valida a chave de acesso para evitar o reprocessamento de notas já existentes no banco.
* **Segurança de Dados:** Uso de "Cofre" de variáveis de ambiente (`.env`) para proteção de credenciais sensíveis.
* **CORS Habilitado:** Configuração de middlewares para permitir comunicação segura entre frontend e API.
* **Suporte Multiestadual:** Extração inteligente de dados para os padrões de Santa Catarina (SC), Pernambuco (PE) e Paraíba (PB).
* **Health Check:** Rota raiz (`/`) para monitoramento de disponibilidade em tempo real.

---

## 🧪 Como Rodar o Projeto

### 1. Pré-requisitos
* Go 1.22 ou superior instalado.
* Conta no MongoDB Atlas (ou instância local do MongoDB).

### 2. Configuração do Ambiente
Crie um arquivo `.env` na raiz do projeto:
```text
MONGO_USER=seu_usuario_atlas
MONGO_PASS=sua_senha_atlas
PORT=8080

```

### 3. Execução

```bash
# Instalar dependências
go mod tidy

# Iniciar o servidor
go run cmd/api/main.go

```

---

## 📈 Próximos Passos

* [ ] Implementar **Firebase Auth** ou **JWT** para gestão de usuários.
* [ ] Criar dashboard de comparação de preços entre diferentes estabelecimentos.
* [ ] Adicionar suporte a OCR para leitura de cupons físicos sem QR Code.
* [ ] Exportação de relatórios mensais de gastos em PDF/Excel.

---

**Desenvolvido com foco em escalabilidade e qualidade de código por Leandro.**

```
