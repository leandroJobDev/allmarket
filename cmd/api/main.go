package main

import (
	"allmarket/internal/usecase"
	"net/http"
	"fmt"

	"github.com/gin-gonic/gin"
)

type Requisicao struct {
	URL string `json:"url"`
}

func main() {
	router := gin.Default()

	// Middleware de CORS
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

	router.POST("/processar", func(c *gin.Context) {
		var req Requisicao
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"erro": "JSON inválido"})
			return
		}

		// Chama o usecase para processar a URL
		nota, err := usecase.ScraperPadraoNacional(req.URL)
        if err != nil {
            fmt.Println("ERRO NO PROCESSAMENTO:", err) // Isso vai aparecer no seu terminal
            c.JSON(http.StatusInternalServerError, gin.H{"erro": err.Error()})
            return
        }

		// Retorna os dados processados para o seu index.html
		c.JSON(http.StatusOK, nota)
	})

	router.Run(":8080")
}