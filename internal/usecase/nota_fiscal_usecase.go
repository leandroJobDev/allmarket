package usecase

import (
	"allmarket/internal/entity"
	"fmt"
	"strings"
)

func ProcessarURL(url string) (entity.NotaFiscal, error) {
	switch {

	// --- GRUPO 1: ESTADOS NO PADRÃO (XML ou Tabela #tabResult) ---
	// Aqui você coloca todos os estados que o ScraperPadraoNacional já resolve.
	case strings.Contains(url, "sef.sc.gov.br"),
		strings.Contains(url, "sefaz.pe.gov.br"),
		strings.Contains(url, "sefaz.pb.gov.br"): // Exemplo: Paraíba também costuma seguir
		return ScraperPadraoNacional(url)

	// --- GRUPO 2: ESTADOS FORA DO PADRÃO (Customizados) ---
	// Se você descobrir que o estado X tem um site totalmente maluco,
	// você cria um caso específico para ele aqui.
	case strings.Contains(url, "portaldaestatistica.exemplo.gov.br"):
		// Exemplo de como você chamaria um scraper único:
		// return ScraperCustomizadoEstadoX(url)
		return entity.NotaFiscal{}, fmt.Errorf("este estado possui um sistema customizado que ainda não foi mapeado")

	// --- GRUPO 3: CASO DE EMERGÊNCIA / DESCONHECIDO ---
	default:
		return entity.NotaFiscal{}, fmt.Errorf("URL não reconhecida. Verifique se o link da nota está correto")
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
