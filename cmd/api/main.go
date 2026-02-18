package main

import (
	"allmarket/internal/infrastructure"
	"allmarket/internal/usecase"
	"context"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"google.golang.org/api/idtoken"
)

type RequisicaoProcessar struct {
	URL   string `json:"url"`
	Email string `json:"email"` // E-mail do usuário logado vindo do frontend
}

type RequisicaoLogin struct {
	Token string `json:"token"`
}

func main() {
	// 1. CARREGAMENTO DAS CONFIGURAÇÕES
	_ = godotenv.Load()

	mongoUser := os.Getenv("MONGO_USER")
	mongoPass := os.Getenv("MONGO_PASS")
	googleClientID := os.Getenv("GOOGLE_CLIENT_ID")
	port := os.Getenv("PORT")

	if port == "" {
		port = "8080"
	}

	// 2. CONEXÃO COM MONGODB
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

	// 3. CONFIGURAÇÃO DO SERVIDOR
	router := gin.Default()

	// Middleware de CORS ajustado para aceitar requisições do seu Front
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	})

	// 4. ROTAS

	// Rota de Health Check
	router.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "AllMarket API Online"})
	})

	// ROTA DE LOGIN DO GOOGLE
	router.POST("/auth/google", func(c *gin.Context) {
		var req RequisicaoLogin
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(400, gin.H{"error": "Token não enviado"})
			return
		}

		// Valida o token com o Google
		payload, err := idtoken.Validate(context.Background(), req.Token, googleClientID)
		if err != nil {
			fmt.Printf("Erro validar token: %v\n", err)
			c.JSON(401, gin.H{"error": "Token inválido"})
			return
		}

		// Extrai dados do usuário
		email := payload.Claims["email"].(string)
		nome := payload.Claims["name"].(string)

		c.JSON(200, gin.H{
			"status": "sucesso",
			"email":  email,
			"name":   nome,
		})
	})

	router.GET("/historico", func(c *gin.Context) {
    email := c.Query("email") // Recebe o e-mail via parâmetro na URL
    if email == "" {
        c.JSON(400, gin.H{"error": "E-mail é obrigatório"})
        return
    }

    // Busca no repositório (MongoDB)
    notas, err := repo.ListarPorEmail(strings.ToLower(email))
    if err != nil {
        c.JSON(500, gin.H{"error": "Erro ao buscar histórico"})
        return
    }

    c.JSON(200, notas)
})

	// ROTA DE PROCESSAR NOTA (VINCULADA AO USUÁRIO)
	router.POST("/processar", func(c *gin.Context) {
		var req RequisicaoProcessar
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(400, gin.H{"error": "Dados inválidos"})
			return
		}

		if req.Email == "" {
			c.JSON(401, gin.H{"error": "Usuário não identificado. Faça login primeiro."})
			return
		}

		// Scraper da Nota
		nota, err := usecase.ScraperPadraoNacional(req.URL)
		if err != nil {
			c.JSON(500, gin.H{"error": "Erro no processamento: " + err.Error()})
			return
		}

		// Vincula a nota ao e-mail do usuário logado
		nota.UsuarioEmail = strings.ToLower(req.Email)

		// Salva no Banco
		err = repo.Salvar(nota)
		if err != nil {
			if err.Error() == "esta nota fiscal já foi processada e salva anteriormente" {
				c.JSON(409, gin.H{"message": "Nota já cadastrada", "nota": nota})
				return
			}
			c.JSON(500, gin.H{"error": "Erro ao salvar no banco"})
			return
		}

		c.JSON(200, nota)
	})

	// 5. START
	fmt.Printf("🚀 Servidor rodando na porta %s...\n", port)
	router.Run(":" + port)
}