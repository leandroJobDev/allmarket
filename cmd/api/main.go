package main

import (
	"allmarket/internal/infrastructure"
	"allmarket/internal/usecase"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

type RequisicaoProcessar struct {
	URL   string `json:"url"`
	Email string `json:"email"`
}

type RequisicaoLogin struct {
	Token string `json:"token"`
}

func main() {
	_ = godotenv.Load()

	mongoUser := os.Getenv("MONGO_USER")
	mongoPass := os.Getenv("MONGO_PASS")

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	clusterAddr := "cluster0.5sz7ony.mongodb.net"
	passEscapada := url.QueryEscape(mongoPass)
	uri := fmt.Sprintf("mongodb+srv://%s:%s@%s/?appName=Cluster0",
		mongoUser, passEscapada, clusterAddr)

	repo, err := infrastructure.NewNotaFiscalRepository(uri)
	if err != nil {
		fmt.Printf("❌ Erro MongoDB: %v\n", err)
		return
	}
	fmt.Println("✅ Banco de Dados conectado!")

	router := gin.Default()

	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, Origin, Accept")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	})

	router.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "AllMarket API Online"})
	})

	router.POST("/auth/google", func(c *gin.Context) {
		var req RequisicaoLogin
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(400, gin.H{"error": "Token ausente"})
			return
		}
		c.JSON(200, gin.H{"status": "ok"})
	})

	router.GET("/historico", func(c *gin.Context) {
		email := c.Query("email")
		if email == "" {
			c.JSON(400, gin.H{"error": "E-mail obrigatório"})
			return
		}

		notas, err := repo.ListarPorEmail(strings.ToLower(email))
		if err != nil {
			fmt.Printf("❌ Erro Histórico: %v\n", err)
			c.JSON(500, gin.H{"error": "Erro ao buscar histórico"})
			return
		}

		if notas == nil {
			c.JSON(200, []interface{}{})
			return
		}
		c.JSON(200, notas)
	})

	router.GET("/config", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"google_client_id": os.Getenv("GOOGLE_CLIENT_ID"),
		})
	})

	router.POST("/processar", func(c *gin.Context) {
		var req RequisicaoProcessar
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(400, gin.H{"error": "Dados inválidos"})
			return
		}

		nota, err := usecase.ScraperPadraoNacional(req.URL)
		if err != nil {
			fmt.Printf("❌ Erro Scraper: %v\n", err)
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}

		nota.UsuarioEmail = strings.ToLower(req.Email)

		err = repo.Salvar(nota)

		if err != nil {
			if mongo.IsDuplicateKeyError(err) || strings.Contains(err.Error(), "E11000") {
				notaExistente, errBusca := repo.BuscarPorChave(nota.Chave)
				if errBusca == nil {
					c.JSON(409, notaExistente)
					return
				}
				c.JSON(409, nota)
				return
			}
			fmt.Printf("❌ Erro ao salvar: %v\n", err)
			c.JSON(500, gin.H{"error": "Erro ao salvar: " + err.Error()})
			return
		}

		c.JSON(200, nota)
	})

	fmt.Println("🚀 Servidor rodando na porta " + port)
	router.Run(":" + port)
}
