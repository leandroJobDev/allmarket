package usecase

import (
	"errors"
	"strings"
)

func ProcessarLink(url string) (string, error) {
	if url == "" {
		return "", errors.New("URL vazia")
	}

	if strings.Contains(url, "fazenda.sp.gov.br") {
		return "Nota de São Paulo detectada", nil
	}

	return "Estado recebido!", nil
}