package entity

type Estabelecimento struct {
	Nome     string `json:"nome"`
	CNPJ     string `json:"cnpj"`
	Endereco string `json:"endereco"`
}

type Item struct {
	Nome          string  `json:"nome"`
	Codigo        string  `json:"codigo"`
	Quantidade    float64 `json:"quantidade"`
	Unidade       string  `json:"unidade"`
	PrecoUnitario float64 `json:"preco_unitario"`
	PrecoTotal    float64 `json:"preco_total"`
}

type NotaFiscal struct {
	Chave           string          `json:"chave"`
	Numero          string          `json:"numero"`
	Serie           string          `json:"serie"`
	DataEmissao     string          `json:"data_emissao"`
	Estabelecimento Estabelecimento `json:"estabelecimento"`
	Itens           []Item          `json:"itens"`
	ValorTotal      float64         `json:"valor_total"`
}

func (n NotaFiscal) CalcularTotalDosItens() any {
	panic("unimplemented")
}
