import React, { useState, useEffect } from 'react';
import { Product } from '../utils/productsApi';
import { X, Save, Loader2 } from 'lucide-react';

interface ProductFormProps {
  product?: Product | null;
  onSave: (product: Omit<Product, 'id' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    nome: '',
    categoria: '',
    preco_estimado: '',
    foto_url: '',
    atributos: {
      keywords: [] as string[],
      descricao: '',
      tecnologias: [] as string[],
    },
  });
  const [keywordsInput, setKeywordsInput] = useState('');
  const [technologiesInput, setTechnologiesInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setFormData({
        nome: product.nome,
        categoria: product.categoria,
        preco_estimado: product.preco_estimado,
        foto_url: product.foto_url,
        atributos: {
          keywords: product.atributos.keywords || [],
          descricao: product.atributos.descricao || '',
          tecnologias: product.atributos.tecnologias || [],
        },
      });
      setKeywordsInput((product.atributos.keywords || []).join(', '));
      setTechnologiesInput((product.atributos.tecnologias || []).join(', '));
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Processar keywords e tecnologias
      const keywords = keywordsInput
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0);
      const tecnologias = technologiesInput
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      await onSave({
        ...formData,
        atributos: {
          ...formData.atributos,
          keywords,
          tecnologias,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar produto');
    } finally {
      setLoading(false);
    }
  };

  const addKeyword = () => {
    const keyword = keywordsInput.trim();
    if (keyword && !formData.atributos.keywords.includes(keyword)) {
      setFormData({
        ...formData,
        atributos: {
          ...formData.atributos,
          keywords: [...formData.atributos.keywords, keyword],
        },
      });
      setKeywordsInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData({
      ...formData,
      atributos: {
        ...formData.atributos,
        keywords: formData.atributos.keywords.filter(k => k !== keyword),
      },
    });
  };

  return (
    <div className="bg-[#121212] border border-white/10 rounded-xl p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">
          {product ? 'Editar Produto' : 'Adicionar Novo Produto'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Nome do Produto *
          </label>
          <input
            type="text"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            required
            className="w-full px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-red"
            placeholder="Ex: Gestão de Tráfego Pago"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Categoria *
          </label>
          <select
            value={formData.categoria}
            onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
            required
            className="w-full px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-red"
          >
            <option value="">Selecione uma categoria</option>
            <option value="Marketing Recorrente">Marketing Recorrente</option>
            <option value="Lançamentos Digitais">Lançamentos Digitais</option>
            <option value="Tecnologia + IA">Tecnologia + IA</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Preço Estimado
          </label>
          <input
            type="text"
            value={formData.preco_estimado}
            onChange={(e) => setFormData({ ...formData, preco_estimado: e.target.value })}
            className="w-full px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-red"
            placeholder="Ex: R$ 2.500 - R$ 15.000/mês"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            URL da Foto
          </label>
          <input
            type="url"
            value={formData.foto_url}
            onChange={(e) => setFormData({ ...formData, foto_url: e.target.value })}
            className="w-full px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-red"
            placeholder="https://exemplo.com/imagem.jpg"
          />
          {formData.foto_url && (
            <img
              src={formData.foto_url}
              alt="Preview"
              className="mt-3 w-full h-48 object-cover rounded-lg border border-white/10"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Descrição
          </label>
          <textarea
            value={formData.atributos.descricao}
            onChange={(e) =>
              setFormData({
                ...formData,
                atributos: { ...formData.atributos, descricao: e.target.value },
              })
            }
            rows={3}
            className="w-full px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-red"
            placeholder="Descrição do produto..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Keywords (separadas por vírgula)
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={keywordsInput}
              onChange={(e) => setKeywordsInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addKeyword();
                }
              }}
              className="flex-1 px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-red"
              placeholder="Ex: Tráfego Pago, Google Ads, Facebook Ads"
            />
            <button
              type="button"
              onClick={addKeyword}
              className="px-4 py-2 bg-brand-red hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Adicionar
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.atributos.keywords.map((keyword, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-2 px-3 py-1 bg-brand-red/20 text-brand-red rounded-lg text-sm"
              >
                {keyword}
                <button
                  type="button"
                  onClick={() => removeKeyword(keyword)}
                  className="hover:text-red-300"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Tecnologias (separadas por vírgula)
          </label>
          <input
            type="text"
            value={technologiesInput}
            onChange={(e) => setTechnologiesInput(e.target.value)}
            className="w-full px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-red"
            placeholder="Ex: Google Ads API, Meta Business API, Analytics"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-brand-red hover:bg-red-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Salvar Produto
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;

