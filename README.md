# Corretor Somatória PSS 2

Sistema de correção de provas de somatória com suporte a OCR via Google Cloud Vision API.

## Funcionalidades

- ✅ Correção de provas com sistema de somatória (1, 2, 4, 8, 16)
- ✅ Crédito parcial (acerta algumas opções = pontos proporcionais)
- ✅ Se errar uma opção = zera a questão (sem negativo)
- ✅ Leitura automática de respostas via foto (OCR com IA)
- ✅ Gabarito pré-carregado (editável)
- ✅ Desempenho por matéria

## Como Usar

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar API Key (para OCR)
Crie um arquivo `.env` na raiz do projeto:
```env
GOOGLE_CLOUD_API_KEY=sua_api_key_aqui
```

Para obter a API Key (grátis, 1000 usos/mês):
1. Acesse [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Ative a [Cloud Vision API](https://console.cloud.google.com/apis/library/vision.googleapis.com)
3. Crie uma **Chave de API**

### 3. Iniciar o servidor
```bash
npm start
```

Acesse: **http://localhost:3000**

## Estrutura do Projeto

| Arquivo | Descrição |
|---------|-----------|
| `index.html` | Interface principal |
| `style.css` | Estilos (dark mode) |
| `script.js` | Lógica frontend + OCR |
| `server.js` | Servidor Express com endpoint OCR |
| `.env` | Sua API Key (não commitado) |

## Sistema de Pontuação

- **Acerto total**: Soma correta = 100% da questão
- **Acerto parcial**: Marcou opções corretas (sem erradas) = pontos proporcionais
- **Erro**: Marcou opção errada = 0 pontos (não perde, só zera)

## Licença

MIT
