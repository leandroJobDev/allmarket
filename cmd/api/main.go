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

	// CONEXÃO COM MONGODB
	clusterAddr := "cluster0.5sz7ony.mongodb.net"
	passEscapada := url.QueryEscape(mongoPass)
	uri := fmt.Sprintf("mongodb+srv://%s:%s@%s/?appName=Cluster0", 
		mongoUser, passEscapada, clusterAddr)

	repo, err := infrastructure.NewMongoRepository(uri)
	if err != nil {
		fmt.Printf("❌ Erro MongoDB: %v\n", err)
		return
	}
	fmt.Println("✅ Banco de Dados conectado!")

	router := gin.Default()

	// MIDDLEWARE CORS TOTAL
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, Origin, Accept")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	})

	// ROTAS
	router.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "AllMarket API Online"})
	})

	// ROTA DE LOGIN 
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
			c.JSON(500, gin.H{"error": "Erro histórico"})
			return
		}
		c.JSON(200, notas)
	})

	router.POST("/processar", func(c *gin.Context) {
		var req RequisicaoProcessar
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(400, gin.H{"error": "Dados inválidos"})
			return
		}
		
		nota, err := usecase.ScraperPadraoNacional(req.URL)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		
		nota.UsuarioEmail = strings.ToLower(req.Email)
		err = repo.Salvar(nota)
		
		if err != nil && err.Error() == "esta nota fiscal já foi processada e salva anteriormente" {
			c.JSON(409, nota)
			return
		}
		c.JSON(200, nota)
	})

	router.Run(":" + port)
}