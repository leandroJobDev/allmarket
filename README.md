# AllMarket - Sistema de Gestão de Compras
O AllMarket é uma API robusta desenvolvida em Go, projetada para gerenciar e validar dados de compras a partir de notas fiscais. O projeto utiliza padrões de arquitetura modernos para garantir escalabilidade e facilidade de manutenção.

🛠️ Tecnologias e Ferramentas
Linguagem: Go (Golang) v1.25+

Framework Web: Gin Gonic (Alta performance e roteamento eficiente)

Arquitetura: Clean Architecture (Separação de responsabilidades)

Sistema Operacional de Desenvolvimento: BigLinux (Base Arch Linux)

🏗️ Estrutura do Projeto (Clean Architecture)
O projeto está organizado seguindo os princípios da arquitetura limpa, dividindo a lógica em camadas:

cmd/api/: Ponto de entrada da aplicação. Contém a configuração do servidor HTTP (Gin) e a definição das rotas.

internal/entity/: Contém os modelos de domínio (Nota Fiscal, Itens) e as regras de negócio essenciais. É a camada mais interna e independente.

internal/usecase/: Camada que contém as regras de aplicação. Aqui reside a lógica de cálculo de totais e validação de dados da nota fiscal.

🚀 Funcionalidades Atuais
Servidor HTTP: API REST rodando com o framework Gin.

Validação de Nota Fiscal: Lógica isolada para cálculo de impostos e soma de itens, garantindo a integridade dos dados financeiros.

Saída JSON: Respostas estruturadas seguindo os padrões de mercado para consumo por front-ends ou aplicativos móveis.
