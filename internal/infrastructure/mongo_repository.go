package infrastructure

import (
	"allmarket/internal/entity"
	"context"
	"fmt"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type MongoRepository struct {
	client     *mongo.Client
	collection *mongo.Collection
}

// NewMongoRepository cria a conexão e inicializa a collection
func NewMongoRepository(uri string) (*MongoRepository, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(options.Client().ApplyURI(uri))
	if err != nil {
		return nil, fmt.Errorf("falha ao conectar no driver: %w", err)
	}

	// Verifica se a conexão está ativa
	err = client.Ping(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("falha ao dar ping no Atlas: %w", err)
	}

	db := client.Database("allmarket")
	collection := db.Collection("notas")

	return &MongoRepository{
		client:     client,
		collection: collection,
	}, nil
}

// Salvar insere a nota e retorna o erro original do Mongo para o main.go tratar o 409
func (r *MongoRepository) Salvar(nota entity.NotaFiscal) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if r.collection == nil {
		return fmt.Errorf("coleção não inicializada")
	}

	_, err := r.collection.InsertOne(ctx, nota)
	if err != nil {
		// Retornamos o erro bruto para que o main.go use mongo.IsDuplicateKeyError(err)
		return err
	}

	return nil
}

// ListarPorEmail busca o histórico e garante que não retorne nil
func (r *MongoRepository) ListarPorEmail(email string) ([]entity.NotaFiscal, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if r.collection == nil {
		return nil, fmt.Errorf("repositório não inicializado")
	}

	// Normaliza o e-mail para evitar erros de busca (Case Insensitive)
	emailBusca := strings.ToLower(strings.TrimSpace(email))
	filter := bson.M{"usuario_email": emailBusca}

	// Ordena por data de emissão decrescente (mais recentes primeiro)
	opts := options.Find().SetSort(bson.D{{Key: "data_emissao", Value: -1}})

	cursor, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, fmt.Errorf("erro na busca: %w", err)
	}
	defer cursor.Close(ctx)

	// Inicializamos como slice vazio para o JSON retornar [] em vez de null
	notas := []entity.NotaFiscal{}

	if err = cursor.All(ctx, &notas); err != nil {
		return nil, fmt.Errorf("erro ao decodificar notas: %w", err)
	}

	return notas, nil
}

// BuscarTodas (Opcional, caso queira listar tudo sem filtro)
func (r *MongoRepository) BuscarTodas() ([]entity.NotaFiscal, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := r.collection.Find(ctx, bson.D{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	notas := []entity.NotaFiscal{}
	if err = cursor.All(ctx, &notas); err != nil {
		return nil, err
	}

	return notas, nil
}