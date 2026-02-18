package entity

type Estabelecimento struct {
    Nome     string `json:"nome" bson:"nome"`
    CNPJ     string `json:"cnpj" bson:"cnpj"`
    Endereco string `json:"endereco" bson:"endereco"`
}

type Item struct {
    Nome          string  `json:"nome" bson:"nome"`
    Codigo        string  `json:"codigo" bson:"codigo"`
    Quantidade    float64 `json:"quantidade" bson:"quantidade"`
    Unidade       string  `json:"unidade" bson:"unidade"`
    PrecoUnitario float64 `json:"preco_unitario" bson:"preco_unitario"`
    PrecoTotal    float64 `json:"preco_total" bson:"preco_total"`
}

type NotaFiscal struct {
    Chave           string          `json:"chave" bson:"_id"` 
    Numero          string          `json:"numero" bson:"numero"`
    Serie           string          `json:"serie" bson:"serie"`
    DataEmissao     string          `json:"data_emissao" bson:"data_emissao"`
    Protocolo       string          `json:"protocolo" bson:"protocolo"`
    Estabelecimento Estabelecimento `json:"estabelecimento" bson:"estabelecimento"`
    Itens           []Item          `json:"itens" bson:"itens"`
    ValorTotal      float64         `json:"valor_total" bson:"valor_total"`
}

func (n NotaFiscal) CalcularTotalDosItens() float64 {
    var total float64
    for _, item := range n.Itens {
        total += item.PrecoTotal
    }
    return total
}