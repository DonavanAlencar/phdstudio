import React, { useState } from 'react';
import ProductsList from './ProductsList';
import ProductForm from './ProductForm';
import { Product, getProducts } from '../utils/productsApi';
import { AlertCircle } from 'lucide-react';

const ProductsAdmin: React.FC = () => {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setView('form');
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setView('form');
  };

  const handleCancel = () => {
    setView('list');
    setEditingProduct(null);
  };

  const handleSave = async (productData: Omit<Product, 'id' | 'updated_at'>) => {
    try {
      // A API REST atualmente só suporta leitura (GET)
      // Para criar/editar produtos, use o WordPress Admin
      setMessage({
        type: 'error',
        text: 'A API REST atualmente só suporta leitura. Para criar ou editar produtos, acesse o WordPress Admin em http://seu-servidor:8080/wp-admin',
      });
      
      // Limpar mensagem após 5 segundos
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Erro ao salvar produto',
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-500/10 border border-green-500/50 text-green-400'
                : 'bg-red-500/10 border border-red-500/50 text-red-400'
            }`}
          >
            <AlertCircle className="w-5 h-5" />
            <span>{message.text}</span>
            <button
              onClick={() => setMessage(null)}
              className="ml-auto text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
        )}

        {view === 'list' ? (
          <ProductsList onEdit={handleEdit} onAdd={handleAdd} />
        ) : (
          <ProductForm
            product={editingProduct}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
};

export default ProductsAdmin;

