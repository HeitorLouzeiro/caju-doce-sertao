# Caju Doce Sertão

Site institucional e vitrine de pedidos da **Caju Doce Sertão**, marca artesanal de produtos derivados do caju (cajuína, doces, geleia, castanha, polpa e carne vegana) produzida em Corrente — Piauí.

🔗 **Site publicado:** https://HeitorLouzeiro.github.io/caju-doce-sertao/

## Funcionalidades

- Vitrine de produtos com alternância entre **modo varejo** (consumo próprio) e **modo atacado** (revenda, preço por caixa).
- Carrinho de compras client-side com cálculo automático de total, mínimo de pedido para atacado e finalização via **WhatsApp**.
- Catálogo de produtos carregado de um arquivo JSON ([data/products.json](data/products.json)), independente do código.
- Imagens otimizadas em WebP com fallback automático para JPEG via `<picture>`.

## Estrutura do projeto

```
.
├── index.html          # marcação da página
├── css/
│   └── styles.css      # estilos
├── js/
│   └── app.js          # lógica da vitrine e do carrinho
├── data/
│   └── products.json   # catálogo de produtos (preços, descrições, imagens)
└── assets/
    └── img/             # fotos dos produtos e logo (.jpg + .webp)
```

## Rodando localmente

Como o catálogo é carregado via `fetch`, é preciso servir os arquivos por HTTP (abrir o `index.html` direto pelo `file://` não funciona).

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

## Editando o catálogo

Para adicionar, remover ou alterar produtos, edite [data/products.json](data/products.json). Cada item segue este formato:

```json
{
  "id": "caju500",
  "name": "Cajuína Artesanal",
  "vol": "Garrafa de vidro · 500ml",
  "img": "assets/img/produto-caju500.jpg",
  "imgWebp": "assets/img/produto-caju500.webp",
  "desc": "Descrição curta do produto.",
  "tags": [{ "k": "star", "t": "Carro-chefe" }],
  "varejo": 10.9,
  "atacado": 8.0,
  "caixa": 12
}
```

As fotos ficam em `assets/img/`. Adicione tanto a versão `.jpg` quanto a `.webp` e referencie os dois caminhos no JSON.

## Configurando o WhatsApp

O número usado no botão "Finalizar pelo WhatsApp" está em [js/app.js](js/app.js), na constante `WHATS` (formato: DDI + DDD + número, sem símbolos).

## Deploy (GitHub Pages)

Este repositório é publicado automaticamente pelo GitHub Pages a partir da branch `main`. Qualquer push para `main` atualiza o site publicado.

## Licença

Todos os direitos reservados — Caju Doce Sertão.
