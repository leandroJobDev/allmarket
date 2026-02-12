package usecase

import "allmarket/internal/entity"

// CalcularTotalNota soma os preços de todos os itens da nota fiscal
func CalcularTotalNota(itens []entity.Item) float64 {
	var soma float64
	for _, item := range itens {
		soma += item.Preco * item.Quantidade
	}
	return soma
}
