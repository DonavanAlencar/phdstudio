import React, { useState, useEffect } from 'react';
import { getProducts, Product } from '../utils/productsApi';
import { Edit, Trash2, Plus, Loader2, AlertCircle } from 'lucide-react';

interface ProductsListProps {
  onEdit: (product: Product) => void;
  onAdd: () => void;
}

const ProductsList: React.FC<ProductsListProps> = ({ onEdit, onAdd }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = filterCategory === 'all' 
    ? products 
    : products.filter(p => p.categoria === filterCategory);

  const categories = Array.from(new Set(products.map(p => p.categoria)));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-brand-red" />
        <span className="ml-3 text-gray-400">Carregando produtos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6">
        <div className="flex items-center gap-3 text-red-400">
          <AlertCircle className="w-6 h-6" />
          <div>
            <h3 className="font-bold">Erro ao carregar produtos</h3>
            <p className="text-sm text-red-300 mt-1">{error}</p>
          </div>
        </div>
        <button
          onClick={loadProducts}
          className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com filtros */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Produtos PHD Studio</h2>
          <p className="text-gray-400">Total: {products.length} produtos</p>
        </div>
        <div className="flex gap-3">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-red"
          >
            <option value="all">Todas as categorias</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button
            onClick={onAdd}
            className="px-6 py-2 bg-brand-red hover:bg-red-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Adicionar Produto
          </button>
        </div>
      </div>

      {/* Lista de produtos por categoria */}
      {categories.filter(cat => filterCategory === 'all' || cat === filterCategory).map(category => {
        const categoryProducts = filteredProducts.filter(p => p.categoria === category);
        if (categoryProducts.length === 0) return null;

        return (
          <div key={category} className="bg-[#121212] border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 pb-3 border-b border-white/10">
              {category}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryProducts.map(product => (
                <div
                  key={product.id}
                  className="bg-[#1a1a1a] border border-white/5 rounded-lg p-4 hover:border-brand-red/50 transition-colors"
                >
                  {product.foto_url && (
                    <img
                      src={product.foto_url}
                      alt={product.nome}
                      className="w-full h-40 object-cover rounded-lg mb-3"
                    />
                  )}
                  <h4 className="font-bold text-white mb-2">{product.nome}</h4>
                  <p className="text-sm text-gray-400 mb-2">{product.preco_estimado}</p>
                  {product.atributos.keywords && product.atributos.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {product.atributos.keywords.slice(0, 3).map((keyword, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 bg-brand-red/20 text-brand-red rounded"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => onEdit(product)}
                      className="flex-1 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Tem certeza que deseja excluir "${product.nome}"?`)) {
                          alert('Para excluir produtos, acesse o WordPress Admin em http://seu-servidor:8080/wp-admin');
                        }
                      }}
                      className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                      title="Excluir via WordPress Admin"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>Nenhum produto encontrado.</p>
        </div>
      )}
    </div>
  );
};

export default ProductsList;

