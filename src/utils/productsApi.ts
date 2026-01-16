/**
 * API Client para produtos PHD Studio
 */

// URL da API - usar path relativo no mesmo domínio
// Isso evita problemas de CORS e não requer configuração de subdomínio
const API_BASE_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' 
  ? `${window.location.protocol}//${window.location.host}/api`
  : 'http://localhost:3001');
const API_KEY = import.meta.env.VITE_PHD_API_KEY || '';

export interface Product {
  id: number;
  nome: string;
  categoria: string;
  atributos: {
    keywords?: string[];
    descricao?: string;
    tecnologias?: string[];
  };
  preco_estimado: string;
  foto_url: string;
  updated_at: string;
}

export interface ProductsResponse {
  success: boolean;
  count: number;
  data: Product[];
  timestamp?: string;
}

export interface ProductResponse {
  success: boolean;
  data: Product;
  timestamp?: string;
}

/**
 * Fazer requisição autenticada
 */
async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-PHD-API-KEY': API_KEY,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(error.message || `Erro ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Listar todos os produtos
 */
export async function getProducts(): Promise<Product[]> {
  const response: ProductsResponse = await fetchWithAuth('/phd/v1/products');
  return response.data;
}

/**
 * Obter produto por ID
 */
export async function getProduct(id: number): Promise<Product> {
  const response: ProductResponse = await fetchWithAuth(`/phd/v1/products/${id}`);
  return response.data;
}

/**
 * Health check da API
 */
export async function healthCheck(): Promise<{ status: string; timestamp: string }> {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error('API não está respondendo');
  }
  return response.json();
}

/**
 * Criar novo produto
 * Nota: A API atual só tem GET. Esta função está preparada para quando POST for implementado.
 */
export async function createProduct(product: Omit<Product, 'id' | 'updated_at'>): Promise<Product> {
  // Por enquanto, retorna erro informando que precisa ser feito via WordPress Admin
  throw new Error('Criação de produtos deve ser feita via WordPress Admin. A API REST atualmente só suporta leitura.');
}

/**
 * Atualizar produto
 * Nota: A API atual só tem GET. Esta função está preparada para quando PUT/PATCH for implementado.
 */
export async function updateProduct(id: number, product: Omit<Product, 'id' | 'updated_at'>): Promise<Product> {
  // Por enquanto, retorna erro informando que precisa ser feito via WordPress Admin
  throw new Error('Atualização de produtos deve ser feita via WordPress Admin. A API REST atualmente só suporta leitura.');
}

/**
 * Deletar produto
 * Nota: A API atual só tem GET. Esta função está preparada para quando DELETE for implementado.
 */
export async function deleteProduct(id: number): Promise<void> {
  // Por enquanto, retorna erro informando que precisa ser feito via WordPress Admin
  throw new Error('Exclusão de produtos deve ser feita via WordPress Admin. A API REST atualmente só suporta leitura.');
}

