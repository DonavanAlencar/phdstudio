/**
 * Formulário de Criar/Editar Lead
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../utils/api';
import type { Lead, Tag } from '../../types';
import {
  Save,
  X,
  Mail,
  User,
  Phone,
  Tag as TagIcon,
  AlertCircle,
} from 'lucide-react';

export default function LeadForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [loadingLead, setLoadingLead] = useState(isEditing);
  const [tags, setTags] = useState<Tag[]>([]);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    status: 'new' as Lead['status'],
    stage: 'Curioso' as Lead['stage'],
    source: '',
    pain_point: '',
    assigned_to: null as number | null,
    tags: [] as number[],
    custom_fields: {} as Record<string, string>,
  });

  useEffect(() => {
    loadTags();
    if (isEditing) {
      loadLead();
    }
  }, [id]);

  const loadTags = async () => {
    try {
      const response = await api.getTags({ limit: 100 });
      setTags(response.data);
    } catch (error) {
      // console.error('Erro ao carregar tags:', error);
    }
  };

  const loadLead = async () => {
    if (!id) return;
    setLoadingLead(true);
    try {
      const lead = await api.getLead(parseInt(id));
      setFormData({
        email: lead.email || '',
        first_name: lead.first_name || '',
        last_name: lead.last_name || '',
        phone: lead.phone || '',
        status: lead.status,
        stage: lead.stage,
        source: lead.source || '',
        pain_point: lead.pain_point || '',
        assigned_to: lead.assigned_to,
        tags: lead.tags?.map((t) => t.id) || [],
        custom_fields: lead.custom_fields || {},
      });
    } catch (error) {
      // console.error('Erro ao carregar lead:', error);
      setError('Erro ao carregar lead');
    } finally {
      setLoadingLead(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEditing) {
        await api.updateLead(parseInt(id!), formData);
      } else {
        await api.createLead(formData);
      }
      navigate('/admin/leads');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erro ao salvar lead');
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tagId: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter((id) => id !== tagId)
        : [...prev.tags, tagId],
    }));
  };

  if (loadingLead) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-brand-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Editar Lead' : 'Novo Lead'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEditing ? 'Atualize as informações do lead' : 'Preencha os dados do novo lead'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Informações Básicas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                placeholder="Primeiro nome"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sobrenome
            </label>
            <input
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
              placeholder="Sobrenome"
            />
          </div>
        </div>

        {/* Status e Estágio */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Lead['status'] })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
            >
              <option value="new">Novo</option>
              <option value="contacted">Em Contato</option>
              <option value="qualified">Qualificado</option>
              <option value="converted">Convertido</option>
              <option value="lost">Perdido</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estágio
            </label>
            <select
              value={formData.stage}
              onChange={(e) => setFormData({ ...formData, stage: e.target.value as Lead['stage'] })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
            >
              <option value="Curioso">Curioso</option>
              <option value="Avaliando">Avaliando</option>
              <option value="Pronto para agir">Pronto para agir</option>
            </select>
          </div>
        </div>

        {/* Origem e Dor/Necessidade */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Origem/Canal
          </label>
          <input
            type="text"
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
            placeholder="Website, Facebook Ads, etc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dor/Necessidade
          </label>
          <textarea
            value={formData.pain_point}
            onChange={(e) => setFormData({ ...formData, pain_point: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
            placeholder="Descreva a dor ou necessidade do lead..."
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 p-4 border border-gray-300 rounded-lg min-h-[100px]">
            {tags.length === 0 ? (
              <span className="text-sm text-gray-400">Nenhuma tag disponível</span>
            ) : (
              tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                    formData.tags.includes(tag.id)
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={{
                    backgroundColor: formData.tags.includes(tag.id) ? tag.color : undefined,
                  }}
                >
                  <TagIcon className="w-4 h-4" />
                  {tag.name}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Botões */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/admin/leads')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <X className="w-5 h-5" />
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-brand-red text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Salvar Lead
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

