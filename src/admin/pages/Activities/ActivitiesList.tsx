/**
 * Lista de Atividades
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../utils/api';
import type { Activity } from '../../types';
import { Plus, Search, Filter, CheckCircle, Clock, X, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ActivitiesList() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    completed: '',
    lead_id: '',
  });

  useEffect(() => {
    loadActivities();
  }, [filters]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const params: any = {
        limit: 50,
      };

      if (filters.type) params.type = filters.type;
      if (filters.completed !== '') {
        params.completed = filters.completed === 'true';
      }
      if (filters.lead_id) params.lead_id = parseInt(filters.lead_id);

      const response = await api.getActivities(params);
      setActivities(response.data);
    } catch (error) {
      console.error('Erro ao carregar atividades:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id: number) => {
    try {
      await api.completeActivity(id);
      loadActivities();
    } catch (error) {
      console.error('Erro ao completar atividade:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja deletar esta atividade?')) return;

    try {
      await api.deleteActivity(id);
      loadActivities();
    } catch (error) {
      console.error('Erro ao deletar atividade:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      call: '📞',
      email: '✉️',
      meeting: '🤝',
      note: '📝',
      task: '✓',
    };
    return icons[type] || '📋';
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      call: 'Ligação',
      email: 'Email',
      meeting: 'Reunião',
      note: 'Nota',
      task: 'Tarefa',
    };
    return labels[type] || type;
  };

  const isOverdue = (dueDate: string | null, completed: boolean) => {
    if (!dueDate || completed) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Atividades</h1>
          <p className="text-gray-600 mt-1">{activities.length} atividade(s)</p>
        </div>
        <Link
          to="/admin/activities/new"
          className="bg-brand-red text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nova Atividade
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
            >
              <option value="">Todos</option>
              <option value="call">Ligação</option>
              <option value="email">Email</option>
              <option value="meeting">Reunião</option>
              <option value="note">Nota</option>
              <option value="task">Tarefa</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.completed}
              onChange={(e) => setFilters({ ...filters, completed: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
            >
              <option value="">Todas</option>
              <option value="false">Pendentes</option>
              <option value="true">Completadas</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lead ID (opcional)
            </label>
            <input
              type="number"
              value={filters.lead_id}
              onChange={(e) => setFilters({ ...filters, lead_id: e.target.value })}
              placeholder="Filtrar por lead..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
            />
          </div>
        </div>
      </div>

      {/* Lista de Atividades */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-brand-red border-t-transparent rounded-full animate-spin" />
        </div>
      ) : activities.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhuma atividade encontrada
          </h3>
          <Link
            to="/admin/activities/new"
            className="inline-flex items-center gap-2 bg-brand-red text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors mt-4"
          >
            <Plus className="w-5 h-5" />
            Criar Primeira Atividade
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className={`bg-white rounded-lg shadow p-6 border-l-4 ${
                activity.completed_at
                  ? 'border-gray-300 bg-gray-50'
                  : isOverdue(activity.due_date, !!activity.completed_at)
                  ? 'border-red-500'
                  : 'border-blue-500'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getTypeIcon(activity.type)}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-gray-500 capitalize">
                          {getTypeLabel(activity.type)}
                        </span>
                        {activity.lead_email && (
                          <>
                            <span className="text-gray-300">•</span>
                            <Link
                              to={`/admin/leads/${activity.lead_id}`}
                              className="text-sm text-blue-600 hover:underline"
                            >
                              {activity.lead_email}
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {activity.description && (
                    <p className="text-gray-600 mb-3">{activity.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {activity.due_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span
                          className={
                            isOverdue(activity.due_date, !!activity.completed_at)
                              ? 'text-red-600 font-semibold'
                              : ''
                          }
                        >
                          {format(new Date(activity.due_date), "dd 'de' MMMM, yyyy", {
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                    )}
                    {activity.completed_at && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>
                          Concluída em{' '}
                          {format(new Date(activity.completed_at), "dd/MM/yyyy 'às' HH:mm", {
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {!activity.completed_at && (
                    <button
                      onClick={() => handleComplete(activity.id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Marcar como concluída"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(activity.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Deletar"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

