package main // 1. Define que este é o ponto de entrada da aplicação

import (
	"allmarket/internal/usecase" // 2. Importa sua lógica de negócio (Usecase)
	"github.com/gin-gonic/gin"   // 3. Importa o framework web
	"net/http"                   // 4. Pacote padrão do Go para códigos de status (200, 404, etc)
)

// 5. Define o formato do JSON que o seu servidor espera receber
type RequisicaoScan struct {
	URL string `json:"url" binding:"required"`
}

func main() {
	// 6. Cria uma instância padrão do Gin (com logs e recuperação de erros) - Roteamento
	r := gin.Default()

	// 7. Define uma rota do tipo POST no endereço "/scan"
	r.POST("/scan", func(c *gin.Context) {
		
		// 8. Declara uma variável baseada na nossa struct
		var input RequisicaoScan

		// 9. O "ShouldBindJSON" tenta ler o corpo da requisição e preencher a variável 'input'
		// Se o JSON estiver errado ou faltar a URL, ele entra no if
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"erro": "Link inválido"})
			return // Interrompe a execução aqui
		}

		// 10. Chama a função que criamos lá no internal/usecase
		// Passamos o link que veio no JSON (input.URL)
		resultado, err := usecase.ProcessarLink(input.URL)
		
		// 11. Se o Usecase devolver um erro, avisamos o cliente (422 Unprocessable Entity)
		if err != nil {
			c.JSON(http.StatusUnprocessableEntity, gin.H{"erro": err.Error()})
			return
		}

		// 12. Se tudo deu certo, envia a resposta final com Status 200 (OK)
		c.JSON(http.StatusOK, gin.H{
			"status": "sucesso",
			"mensagem": resultado,
			"link_recebido": input.URL,
		})
	})

	// 13. Liga o servidor na porta 8080
	r.Run(":8080")
}