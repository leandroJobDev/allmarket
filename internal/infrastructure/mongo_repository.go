package infrastructure

import (
	"allmarket/internal/entity"
	"context"
	"errors"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

// MongoRepository estrutura que guarda a conexão com o banco
type MongoRepository struct {
	client     *mongo.Client
	collection *mongo.Collection
}

// NewMongoRepository cria uma nova conexão e retorna o repositório
func NewMongoRepository(uri string) (*MongoRepository, error) {
	// Tempo limite para tentar a conexão inicial
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Conecta ao MongoDB Atlas usando o Driver v2
	client, err := mongo.Connect(options.Client().ApplyURI(uri))
	if err != nil {
		return nil, fmt.Errorf("falha ao conectar no driver: %w", err)
	}

	// Verifica se o banco está realmente alcançável (Ping)
	err = client.Ping(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("falha ao dar ping no Atlas: %w", err)
	}

	// Define o banco de dados e a coleção
	// No NoSQL, eles são criados automaticamente no primeiro insert
	db := client.Database("allmarket")
	collection := db.Collection("notas")

	return &MongoRepository{
		client:     client,
		collection: collection,
	}, nil
}

// Salvar insere a nota no MongoDB e trata duplicatas
func (r *MongoRepository) Salvar(nota entity.NotaFiscal) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// O MongoDB usará o campo Chave como _id devido à tag bson:"_id" na sua struct
	_, err := r.collection.InsertOne(ctx, nota)
	if err != nil {
		// Verifica se o erro é de chave duplicada (Código 11000)
		if mongo.IsDuplicateKeyError(err) {
			return errors.New("esta nota fiscal já foi processada e salva anteriormente")
		}
		return fmt.Errorf("erro ao inserir no MongoDB: %w", err)
	}

	return nil
}

// BuscarTodas retorna todas as notas salvas no banco
func (r *MongoRepository) BuscarTodas() ([]entity.NotaFiscal, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := r.collection.Find(ctx, options.Find())
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var notas []entity.NotaFiscal
	if err = cursor.All(ctx, &notas); err != nil {
		return nil, err
	}

	return notas, nil
}
func (r *MongoRepository) ListarPorEmail(email string) ([]entity.NotaFiscal, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := r.client.Database("allmarket").Collection("notas")

	// Filtro: busca notas onde o campo usuario_email seja igual ao email passado
	filter := bson.M{"usuario_email": email}
    
	// Opções: Ordenar pela data de emissão (descendente)
	opts := options.Find().SetSort(bson.D{{Key: "data_emissao", Value: -1}})

	cursor, err := collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var notas []entity.NotaFiscal
	if err = cursor.All(ctx, &notas); err != nil {
		return nil, err
	}

	// Se não encontrar nada, retorna um array vazio em vez de nil (evita erro no frontend)
	if notas == nil {
		notas = []entity.NotaFiscal{}
	}

	return notas, nil
}