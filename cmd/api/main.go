package main

import (
	"allmarket/internal/entity"
	"allmarket/internal/usecase"
	"github.com/gin-gonic/gin"
	"net/http"
)

func main() {
	r := gin.Default()

	r.GET("/validar-nota", func(c *gin.Context) {
		itens := []entity.Item{
			{Nome: "Arroz 5kg", Quantidade: 1, Preco: 28.90},
			{Nome: "Feijão 1kg", Quantidade: 3, Preco: 7.50},
		}

		total := usecase.CalcularTotalNota(itens)

		nota := entity.NotaFiscal{
			Mercado: "Supermercado AllMarket",
			Itens:   itens,
			Total:   total,
		}

		c.JSON(http.StatusOK, gin.H{
			"mensagem": "Nota Fiscal processada com sucesso!",
			"nota":     nota,
		})
	})

	r.Run(":8080")
}