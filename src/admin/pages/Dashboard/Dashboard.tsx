/**
 * Página de Dashboard
 */

import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import type { DashboardStats, MyStats } from '../../types';
import {
  Users,
  Activity,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  Tag as TagIcon,
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [myStats, setMyStats] = useState<MyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, myStatsData] = await Promise.all([
        api.getDashboardStats(),
        api.getMyStats(),
      ]);
      setStats(statsData);
      setMyStats(myStatsData);
    } catch (error) {
      // console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-brand-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats || !myStats) {
    return <div>Erro ao carregar dados</div>;
  }

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          title="Total de Leads"
          value={stats.leads.total}
          subtitle="Leads cadastrados"
          color="blue"
        />
        <StatCard
          icon={Activity}
          title="Atividades Pendentes"
          value={myStats.activities.pending}
          subtitle={`${myStats.activities.upcoming} próximas, ${myStats.activities.overdue} atrasadas`}
          color="orange"
        />
        <StatCard
          icon={TrendingUp}
          title="Convertidos"
          value={myStats.leads.converted_this_month}
          subtitle="Este mês"
          color="green"
        />
        <StatCard
          icon={TagIcon}
          title="Tags Ativas"
          value={stats.tags.top.length}
          subtitle="Tags mais usadas"
          color="purple"
        />
      </div>

      {/* Leads por Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Leads por Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {stats.leads.by_status.map((item) => (
            <div key={item.status} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{item.count}</p>
              <p className="text-sm text-gray-600 capitalize">{item.status}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Leads por Estágio */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Leads por Estágio</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.leads.by_stage.map((item) => (
            <div key={item.stage} className="p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{item.count}</p>
              <p className="text-sm text-gray-600">{item.stage}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Minhas Atividades */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Minhas Atividades</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-900">Pendentes</span>
            </div>
            <p className="text-3xl font-bold text-blue-900">{myStats.activities.pending}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-900">Próximas (7 dias)</span>
            </div>
            <p className="text-3xl font-bold text-green-900">{myStats.activities.upcoming}</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="font-semibold text-red-900">Atrasadas</span>
            </div>
            <p className="text-3xl font-bold text-red-900">{myStats.activities.overdue}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: number;
  subtitle: string;
  color: 'blue' | 'orange' | 'green' | 'purple';
}

function StatCard({ icon: Icon, title, value, subtitle, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  );
}

