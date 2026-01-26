/**
 * Detalhes do Lead
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import type { Lead, Activity } from '../../types';
import {
  Edit,
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Tag as TagIcon,
  Activity as ActivityIcon,
  Plus,
  User,
  MapPin,
} from 'lucide-react';

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [leadData, activitiesData] = await Promise.all([
        api.getLead(parseInt(id)),
        api.getActivities({ lead_id: parseInt(id), limit: 50 }),
      ]);
      setLead(leadData);
      setActivities(activitiesData.data);
    } catch (error) {
      // console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      qualified: 'bg-green-100 text-green-800',
      converted: 'bg-purple-100 text-purple-800',
      lost: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      Curioso: 'bg-blue-50 text-blue-700 border-blue-200',
      Avaliando: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'Pronto para agir': 'bg-green-50 text-green-700 border-green-200',
    };
    return colors[stage] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-brand-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Lead não encontrado</h2>
        <Link to="/admin/leads" className="text-brand-red hover:underline">
          Voltar para lista de leads
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/leads"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {lead.first_name || lead.last_name
                ? `${lead.first_name || ''} ${lead.last_name || ''}`.trim()
                : lead.email}
            </h1>
            <p className="text-gray-600 mt-1">{lead.email}</p>
          </div>
        </div>
        <Link
          to={`/admin/leads/${lead.id}/edit`}
          className="bg-brand-red text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center gap-2"
        >
          <Edit className="w-5 h-5" />
          Editar
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações Principais */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informações do Lead */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                <div className="flex items-center gap-2 text-gray-900">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {lead.email}
                </div>
              </div>

              {lead.phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Telefone</label>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {lead.phone}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                <span
                  className={`inline-block px-3 py-1 text-sm font-semibold rounded-full capitalize ${getStatusColor(
                    lead.status
                  )}`}
                >
                  {lead.status}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Estágio</label>
                <span
                  className={`inline-block px-3 py-1 text-sm font-medium rounded border ${getStageColor(
                    lead.stage
                  )}`}
                >
                  {lead.stage}
                </span>
              </div>

              {lead.source && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Origem</label>
                  <div className="flex items-center gap-2 text-gray-900">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {lead.source}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Criado em</label>
                <div className="flex items-center gap-2 text-gray-900">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>

            {lead.pain_point && (
              <div className="mt-6 pt-6 border-t">
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Dor/Necessidade
                </label>
                <p className="text-gray-900">{lead.pain_point}</p>
              </div>
            )}

            {/* Tags */}
            {lead.tags && lead.tags.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <label className="block text-sm font-medium text-gray-500 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {lead.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-3 py-1 rounded-full text-sm font-medium text-white"
                      style={{ backgroundColor: tag.color }}
                    >
                      <TagIcon className="w-3 h-3 inline mr-1" />
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Campos Customizados */}
            {lead.custom_fields && Object.keys(lead.custom_fields).length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Campos Customizados
                </label>
                <div className="space-y-2">
                  {Object.entries(lead.custom_fields).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-sm text-gray-600">{key}:</span>
                      <span className="text-sm text-gray-900">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Atividades */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Atividades</h2>
              <Link
                to={`/admin/activities/new?lead_id=${lead.id}`}
                className="text-brand-red hover:text-red-700 text-sm font-medium flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Nova Atividade
              </Link>
            </div>
            {activities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ActivityIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Nenhuma atividade registrada</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      activity.completed_at
                        ? 'bg-gray-50 border-gray-300'
                        : 'bg-blue-50 border-blue-500'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                        {activity.description && (
                          <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="capitalize">{activity.type}</span>
                          {activity.due_date && (
                            <span>
                              {new Date(activity.due_date).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                          {activity.completed_at && (
                            <span className="text-green-600">✓ Concluída</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status e Ações Rápidas */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
            <div className="space-y-2">
              <Link
                to={`/admin/activities/new?lead_id=${lead.id}&type=call`}
                className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                📞 Registrar Ligação
              </Link>
              <Link
                to={`/admin/activities/new?lead_id=${lead.id}&type=email`}
                className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                ✉️ Registrar Email
              </Link>
              <Link
                to={`/admin/activities/new?lead_id=${lead.id}&type=meeting`}
                className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                🤝 Agendar Reunião
              </Link>
              <Link
                to={`/admin/activities/new?lead_id=${lead.id}&type=note`}
                className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                📝 Adicionar Nota
              </Link>
            </div>
          </div>

          {/* Informações Adicionais */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Detalhes</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500">ID:</span>
                <span className="ml-2 text-gray-900">#{lead.id}</span>
              </div>
              {lead.assigned_first_name && (
                <div>
                  <span className="text-gray-500">Atribuído a:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">
                      {lead.assigned_first_name} {lead.assigned_last_name}
                    </span>
                  </div>
                </div>
              )}
              <div>
                <span className="text-gray-500">Última atualização:</span>
                <span className="ml-2 text-gray-900">
                  {new Date(lead.updated_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

