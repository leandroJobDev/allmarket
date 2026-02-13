package usecase

import (
	"allmarket/internal/entity"
	"strings"
)

func ProcessarURL(input string) (entity.NotaFiscal, error) {
	// Se o input NÃO começar com http, assume que é o HTML colado e processa direto
	if !strings.HasPrefix(input, "http") {
		return ScraperPadraoNacional(input)
	}

	switch {
	case strings.Contains(input, "sef.sc.gov.br"),
		strings.Contains(input, "sefaz.pe.gov.br"),
		strings.Contains(input, "sefaz.pb.gov.br"):
		return ScraperPadraoNacional(input)

	default:
		// Em vez de dar erro, tenta processar mesmo assim (pode ser um link de outro estado)
		return ScraperPadraoNacional(input)
	}
}

// CalcularTotalNota soma os preços totais de todos os itens
func CalcularTotalNota(itens []entity.Item) float64 {
	var soma float64
	for _, item := range itens {
		soma += item.PrecoTotal
	}
	return soma
}
