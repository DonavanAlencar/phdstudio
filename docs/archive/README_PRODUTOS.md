# Interface de Gerenciamento de Produtos - PHD Studio

Interface React para visualizar e gerenciar produtos do PHD Studio através da API REST.

## 🎯 Funcionalidades

### ✅ Implementado
- **Listagem de Produtos**: Visualizar todos os produtos agrupados por categoria
- **Filtro por Categoria**: Filtrar produtos por categoria
- **Visualização Detalhada**: Ver informações completas de cada produto
- **Interface Responsiva**: Funciona em desktop e mobile

### ⚠️ Limitações Atuais
A API REST atualmente **só suporta leitura (GET)**. Para criar, editar ou excluir produtos:
- Use o **WordPress Admin**: `http://seu-servidor:8080/wp-admin`
- Acesse: **PHD Studio** → **Todos os Produtos**

## 🚀 Como Acessar

1. Faça login como administrador (`phdstudioadmin`)
2. No menu, clique em **"Produtos"**
3. Ou acesse diretamente: `/produtos`

## 📋 Estrutura

### Componentes

- **`ProductsAdmin.tsx`** - Componente principal que gerencia a visualização
- **`ProductsList.tsx`** - Lista de produtos com filtros
- **`ProductForm.tsx`** - Formulário para adicionar/editar (preparado para quando API suportar POST/PUT)

### Serviços

- **`productsApi.ts`** - Cliente da API REST
  - `getProducts()` - Listar todos os produtos
  - `getProduct(id)` - Obter produto por ID
  - `healthCheck()` - Verificar se API está online

## 🔧 Configuração

### Variáveis de Ambiente

Adicione ao arquivo `.env`:

```env
VITE_API_URL=http://localhost:3001
VITE_PHD_API_KEY=CNZZoJ6rz7Gcb8Z80rYNSHfCW1jPxZTU
```

**Nota:** Se não configuradas, usa valores padrão:
- `VITE_API_URL`: `http://localhost:3001`
- `VITE_PHD_API_KEY`: `CNZZoJ6rz7Gcb8Z80rYNSHfCW1jPxZTU`

## 🎨 Interface

A interface segue o design system do PHD Studio:
- Fundo escuro (`#0a0a0a`)
- Cards com bordas sutis
- Cores da marca (vermelho `#EF4444`)
- Responsivo e moderno

## 📱 Responsividade

- **Desktop**: Grid de 3 colunas
- **Tablet**: Grid de 2 colunas
- **Mobile**: 1 coluna

## 🔐 Segurança

- Rota protegida: Apenas usuário `phdstudioadmin` pode acessar
- API Key: Enviada automaticamente em todas as requisições
- Validação: Erros de API são tratados e exibidos ao usuário

## 🚧 Próximos Passos

Para habilitar criação/edição via interface React:

1. Implementar endpoints POST/PUT/DELETE na API REST
2. Atualizar `productsApi.ts` com as novas funções
3. Atualizar `ProductsAdmin.tsx` para usar as novas funções
4. Remover avisos sobre WordPress Admin

## 📚 Documentação Relacionada

- `INSTALACAO_DOCKER.md` - Instalação completa
- `API_README.md` - Documentação da API REST
- `README_PLUGIN.md` - Plugin WordPress

