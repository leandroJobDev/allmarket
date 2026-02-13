package usecase

import (
	"strings"
	"testing"
)

func TestProcessarURL(t *testing.T) {
	t.Run("Deve identificar URL de Santa Catarina", func(t *testing.T) {
		url := "https://nfe.sef.sc.gov.br/site/portal/notafiscal/resumo.aspx?p=123"
		_, err := ProcessarURL(url)
		
		// Aqui testamos apenas se ele NÃO retorna erro de "URL não reconhecida"
		if err != nil && strings.Contains(err.Error(), "URL não reconhecida") {
			t.Errorf("Deveria ter reconhecido a URL de SC, mas retornou: %v", err)
		}
	})

	t.Run("Deve identificar URL de Pernambuco", func(t *testing.T) {
		url := "http://nfce.sefaz.pe.gov.br/nfce-web/consultar?p=456"
		_, err := ProcessarURL(url)
		
		if err != nil && strings.Contains(err.Error(), "URL não reconhecida") {
			t.Errorf("Deveria ter reconhecido a URL de PE, mas retornou: %v", err)
		}
	})

	t.Run("Deve retornar erro para URL desconhecida", func(t *testing.T) {
		url := "https://google.com"
		_, err := ProcessarURL(url)
		
		if err == nil {
			t.Error("Deveria ter retornado erro para uma URL que não é de SEFAZ")
		}
	})

	t.Run("Deve aceitar HTML bruto (sem prefixo http)", func(t *testing.T) {
		htmlBruto := "<html><body>Conteúdo da Nota</body></html>"
		_, err := ProcessarURL(htmlBruto)
		
		// Se não deu erro de "URL não reconhecida", significa que ele passou para o Scraper
		if err != nil && strings.Contains(err.Error(), "URL não reconhecida") {
			t.Errorf("Deveria ter aceitado o HTML bruto, mas barrou no switch: %v", err)
		}
	})
}