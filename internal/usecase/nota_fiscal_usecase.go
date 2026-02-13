package usecase

import (
	"allmarket/internal/entity"
	"strings"
	"fmt"
)

func ProcessarURL(input string) (entity.NotaFiscal, error) {
	// Se for HTML bruto (não começa com http), processa direto
	if !strings.HasPrefix(input, "http") {
		return ScraperPadraoNacional(input)
	}

	// Se for URL, verifica se conhecemos o domínio
	switch {
	case strings.Contains(input, "sef.sc.gov.br"),
		strings.Contains(input, "sefaz.pe.gov.br"),
		strings.Contains(input, "sefaz.pb.gov.br"):
		return ScraperPadraoNacional(input)

	default:
		// Agora o teste "Deve retornar erro para URL desconhecida" vai passar
		return entity.NotaFiscal{}, fmt.Errorf("URL não reconhecida. Verifique se o link da nota está correto")
	}
}
