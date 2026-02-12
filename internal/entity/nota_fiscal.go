package entity

type Item struct {
	Nome       string  `json:"nome"`
	Quantidade float64 `json:"quantidade"`
	Preco      float64 `json:"preco"`
}

type NotaFiscal struct {
	Mercado string  `json:"mercado"`
	Itens   []Item  `json:"itens"`
	Total   float64 `json:"total"`
}