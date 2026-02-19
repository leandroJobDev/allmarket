package infrastructure

import (
	"allmarket/internal/entity"
	"context"
	"errors"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type MongoRepository struct {
	client     *mongo.Client
	collection *mongo.Collection
}

func NewMongoRepository(uri string) (*MongoRepository, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(options.Client().ApplyURI(uri))
	if err != nil {
		return nil, fmt.Errorf("falha ao conectar no driver: %w", err)
	}

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

func (r *MongoRepository) Salvar(nota entity.NotaFiscal) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := r.collection.InsertOne(ctx, nota)
	if err != nil {
		if mongo.IsDuplicateKeyError(err) {
			return errors.New("esta nota fiscal já foi processada e salva anteriormente")
		}
		return fmt.Errorf("erro ao inserir no MongoDB: %w", err)
	}

	return nil
}

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

	filter := bson.M{"usuario_email": email}
    
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

	if notas == nil {
		notas = []entity.NotaFiscal{}
	}

	return notas, nil
}