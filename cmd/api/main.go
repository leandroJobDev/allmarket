package main

import (
	"allmarket/internal/usecase"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Requisicao mapeia o JSON enviado pelo seu index.html
type Requisicao struct {
	URL string `json:"url"`
}

func main() {
	// Cria o roteador do Gin
	router := gin.Default()

	// Middleware de CORS: Essencial para que o navegador (seu index.html)
	// consiga falar com o servidor Go sem ser bloqueado por segurança.
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	})

	// Rota principal de processamento
	router.POST("/processar", func(c *gin.Context) {
		var req Requisicao
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"erro": "JSON inválido"})
			return
		}

		nota, err := usecase.ProcessarURL(req.URL)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"erro": err.Error()})
			return
		}

		// Retorna o objeto NotaFiscal completo (com estabelecimento, chave, itens...)
		c.JSON(http.StatusOK, nota)
	})

	// Inicia o servidor na porta 8080
	// Você pode acessar em http://localhost:8080
	router.Run(":8080")
}
