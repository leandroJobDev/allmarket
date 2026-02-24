# AllM@rket 🛒
> **Extrair. Escanear. Economizar.**

O AllM@rket é uma solução inteligente para gestão de consumo pessoal. Ele automatiza a extração de dados de notas fiscais via QR Code, transformando cupons fiscais complexos em um histórico de compras limpo, detalhado e útil.

![AllMarket Demo](./assets/demo.gif) ## ✨ O Conceito 3E
O AllM@rket foi construído sobre três pilares fundamentais que guiam a experiência do usuário:

* **Extrair:** Esqueça a digitação manual. Cole o link da nota e nossa API faz o trabalho pesado.
* **Escanear:** Inteligência que organiza cada item, preço unitário e estabelecimento automaticamente.
* **Economizar:** Histórico na palma da mão para você tomar decisões de compra mais inteligentes.

---

## 🚀 Tecnologias
Este projeto utiliza uma stack moderna focada em performance e escalabilidade:

* **Backend:** [Go](https://golang.org/) (Golang) - Alta performance e concorrência para processamento de dados.
* **Frontend:** HTML5, CSS3 (Tailwind CSS) & JavaScript Vanilla - Interface leve, responsiva e focada no mobile.
* **Auth:** Google Identity Services - Login seguro e simplificado.
* **API:** Arquitetura RESTful com deploy no Render.

---

## 🛠️ Como Funciona? (Simples. Rápido. Automático.)

1.  **Login:** Acesse com sua conta Google.
2.  **Input:** Cole a URL do QR Code da sua Nota Fiscal Gaúcha (ou equivalente).
3.  **Processamento:** Nossa API em Go faz o *parsing* do HTML da SEFAZ em milissegundos.
4.  **Resultado:** Os itens são salvos na sua conta e exibidos em cards detalhados.

---

## 📱 Mobile First
O AllM@rket foi desenhado para ser um **PWA (Progressive Web App)**. A interface se adapta perfeitamente ao seu celular, garantindo que você possa registrar suas compras ainda no estacionamento do mercado.

---

## 🔧 Instalação & Uso Local

```bash
# Clone o repositório
git clone [https://github.com/seu-usuario/allmarket.git](https://github.com/seu-usuario/allmarket.git)

# Entre na pasta do backend e execute
go run main.go

# Abra o index.html no seu navegador (utilize o Live Server para melhor experiência)

```

---

## 📝 Roadmap de Evolução

* [ ] Comparativo de preços entre estabelecimentos.
* [ ] Gráficos de categorias de consumo (Alimentação, Limpeza, etc.).
* [ ] Lista de compras automática baseada no histórico.
* [ ] Suporte a notas fiscais de outros estados.

---

## 🤝 Contribuições

Contribuições são o que fazem a comunidade open source um lugar incrível. Sinta-se à vontade para abrir uma **Issue** ou enviar um **Pull Request**.

---

Desenhado por Leandro

```
