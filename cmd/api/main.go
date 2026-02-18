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
	// 1. CARREGAMENTO DO "COFRE"
	// Tenta carregar o .env da raiz. Se não achar (na Render), ele ignora o erro.
	_ = godotenv.Load()

	usuario := os.Getenv("MONGO_USER")
	senha := os.Getenv("MONGO_PASS")
	porta := os.Getenv("PORT")

	// Se estiver rodando local e a porta estiver vazia, usa 8080
	if porta == "" {
		porta = "8080"
	}

	// Trava de segurança: se não tiver usuário ou senha, o app nem tenta rodar
	if usuario == "" || senha == "" {
		fmt.Println("❌ ERRO CRÍTICO: Variáveis de ambiente MONGO_USER ou MONGO_PASS não configuradas!")
		return
	}

	// 2. CONEXÃO COM O BANCO DE DADOS
	// Montamos a URL usando url.QueryEscape para garantir que caracteres especiais na senha não quebrem a conexão
	clusterAddr := "cluster0.5sz7ony.mongodb.net" // Certifique-se que este é o endereço do seu Atlas
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

	// Middleware de CORS: Permite que seu frontend (HTML) fale com seu backend (Render)
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	})

	// 4. ROTAS

	// Rota Raiz (Para não dar mais Not Found no seu link da Render)
	router.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "API AllMarket Online",
			"mensagem": "O servidor está rodando perfeitamente!",
		})
	})

	// Rota de Processamento
	router.POST("/processar", func(c *gin.Context) {
		var req Requisicao
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"erro": "JSON enviado é inválido"})
			return
		}

		// Chama o Scraper para capturar os dados da nota
		nota, err := usecase.ScraperPadraoNacional(req.URL)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"erro": "Erro ao processar nota: " + err.Error()})
			return
		}

		// Salva no MongoDB
		err = repo.Salvar(nota)
		if err != nil {
			if err.Error() == "esta nota fiscal já foi processada e salva anteriormente" {
				c.JSON(http.StatusConflict, gin.H{"mensagem": "⚠️ Esta nota já está no banco.", "nota": nota})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"erro": "Erro ao salvar no banco"})
			return
		}

		c.JSON(http.StatusOK, nota)
	})

	// 5. START
	fmt.Printf("🚀 Servidor AllMarket rodando na porta %s...\n", porta)
	if err := router.Run(":" + porta); err != nil {
		fmt.Printf("❌ Falha ao subir o servidor: %v\n", err)
	}
}