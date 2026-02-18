package main

import (
	"allmarket/internal/infrastructure"
	"allmarket/internal/usecase"
	"fmt"
	"net/http"
	"net/url"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

type Requisicao struct {
	URL string `json:"url"`
}

func main() {
	// 1. CARREGAR CONFIGURAÇÕES (O seu "Cofre")
	// Tenta carregar o .env. Se não existir (em produção), ele apenas ignora.
	_ = godotenv.Load()

	usuario := os.Getenv("MONGO_USER")
	senha := os.Getenv("MONGO_PASS")
	porta := os.Getenv("PORT")

	// Fallback para porta padrão local
	if porta == "" {
		porta = "8080"
	}

	// Validação de segurança
	if usuario == "" || senha == "" {
		fmt.Println("❌ ERRO: As variáveis MONGO_USER ou MONGO_PASS não foram encontradas!")
		fmt.Println("Verifique seu arquivo .env local ou o painel da Render.")
		return
	}

	// 2. CONEXÃO COM O BANCO DE DADOS
	clusterAddr := "cluster0.5sz7ony.mongodb.net"
	senhaEscapada := url.QueryEscape(senha)
	uri := fmt.Sprintf("mongodb+srv://%s:%s@%s/?appName=Cluster0", 
		usuario, senhaEscapada, clusterAddr)

	repo, err := infrastructure.NewMongoRepository(uri)
	if err != nil {
		fmt.Printf("❌ Falha na conexão com MongoDB Atlas: %v\n", err)
		return
	}
	fmt.Println("✅ Conectado ao MongoDB Atlas com sucesso!")

	// 3. CONFIGURAÇÃO DO SERVIDOR (GIN)
	router := gin.Default()

	// Middleware de CORS - Essencial para o Front-end conseguir falar com o Back-end
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

	// 4. ROTAS
	router.POST("/processar", func(c *gin.Context) {
		var req Requisicao
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"erro": "JSON enviado é inválido"})
			return
		}

		// Chama o Scraper (Lógica de captura)
		nota, err := usecase.ScraperPadraoNacional(req.URL)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"erro": err.Error()})
			return
		}

		// Tenta salvar no banco de dados
		err = repo.Salvar(nota)
		if err != nil {
			// Tratamento específico para nota duplicada
			if err.Error() == "esta nota fiscal já foi processada e salva anteriormente" {
				c.JSON(http.StatusConflict, gin.H{
					"mensagem": "⚠️ Esta nota já consta no seu histórico!",
					"nota":     nota,
				})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"erro": "Erro ao salvar no banco de dados"})
			return
		}

		// Retorna a nota processada com sucesso
		c.JSON(http.StatusOK, nota)
	})

	// 5. INICIALIZAÇÃO
	fmt.Printf("🚀 AllMarket API subindo na porta %s...\n", porta)
	
	// router.Run bloqueia o processo e mantém o servidor vivo
	errServer := router.Run(":" + porta)
	if errServer != nil {
		fmt.Printf("❌ O servidor parou inesperadamente: %v\n", errServer)
	}
}