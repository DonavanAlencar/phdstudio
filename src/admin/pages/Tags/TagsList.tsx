/**
 * Lista de Tags
 */

import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import type { Tag } from '../../types';
import { Plus, Edit, Trash2, Tag as TagIcon, Search } from 'lucide-react';
import TagForm from './TagForm';

export default function TagsList() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const response = await api.getTags({ limit: 100, search });
      setTags(response.data);
    } catch (error) {
      // console.error('Erro ao carregar tags:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTags();
  }, [search]);

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja deletar esta tag? Isso removerá a tag de todos os leads.')) return;

    try {
      await api.deleteTag(id);
      loadTags();
    } catch (error) {
      // console.error('Erro ao deletar tag:', error);
      alert('Erro ao deletar tag');
    }
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTag(null);
    loadTags();
  };

  if (showForm) {
    return (
      <TagForm
        tag={editingTag}
        onClose={handleFormClose}
        onSave={handleFormClose}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tags</h1>
          <p className="text-gray-600 mt-1">{tags.length} tag(s) cadastrada(s)</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-brand-red text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nova Tag
        </button>
      </div>

      {/* Busca */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
          />
        </div>
      </div>

      {/* Lista de Tags */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-brand-red border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tags.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <TagIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhuma tag encontrada
          </h3>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-brand-red text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors mt-4"
          >
            <Plus className="w-5 h-5" />
            Criar Primeira Tag
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="bg-white rounded-lg shadow p-6 border-l-4"
              style={{ borderColor: tag.color }}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="px-3 py-1 rounded-full text-white text-sm font-medium"
                  style={{ backgroundColor: tag.color }}
                >
                  <TagIcon className="w-4 h-4 inline mr-1" />
                  {tag.name}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(tag)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(tag.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Deletar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {tag.description && (
                <p className="text-sm text-gray-600">{tag.description}</p>
              )}
              <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                <span
                  className="inline-block w-4 h-4 rounded-full mr-2"
                  style={{ backgroundColor: tag.color }}
                />
                Cor: {tag.color}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

