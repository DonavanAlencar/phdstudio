import React, { useEffect, useState } from 'react';
import { Plus, Edit, X, Trash2 } from 'lucide-react';
import { api } from '../../admin/utils/api';

interface Client {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company_name?: string;
  is_active: boolean;
  user_count?: number;
  created_at?: string;
}

const ClientsManagement: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company_name: '',
    is_active: true
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    try {
      // Verificar se há token antes de fazer a requisição
      const token = localStorage.getItem('accessToken');
      if (!token) {
        // console.warn('⚠️ [ClientsManagement] Nenhum token encontrado. Redirecionando para login...');
        alert('Você precisa fazer login para acessar esta página.');
        window.location.href = '/login';
        return;
      }

      const data = await api.getClients();
      setClients(data);
    } catch (error: any) {
      // console.error('Erro ao carregar clientes:', error);
      if (error.response?.status === 401) {
        // Limpar tokens inválidos
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        alert('Sessão expirada. Por favor, faça login novamente.');
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        company_name: formData.company_name || null,
        is_active: formData.is_active
      };

      if (editingClient) {
        await api.updateClient(editingClient.id, payload);
      } else {
        await api.createClient(payload);
      }

      setShowModal(false);
      setEditingClient(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company_name: '',
        is_active: true
      });
      loadClients();
    } catch (error: any) {
      // console.error('Erro ao salvar cliente:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Erro ao salvar cliente';
      alert(errorMessage);
      if (error.response?.status === 401) {
        // Admin CRM removido - apenas logar erro
        // console.error('Sessão expirada');
      }
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone || '',
      company_name: client.company_name || '',
      is_active: client.is_active
    });
    setShowModal(true);
  };

  const handleToggleActive = async (client: Client) => {
    try {
      await api.updateClient(client.id, { is_active: !client.is_active });
      loadClients();
    } catch (error: any) {
      // console.error('Erro ao atualizar cliente:', error);
      if (error.response?.status === 401) {
        alert('Sessão expirada. Por favor, faça login novamente.');
        // Admin CRM removido - apenas logar erro
        // console.error('Sessão expirada');
      }
    }
  };

  const handleDeactivate = async (client: Client) => {
    if (!window.confirm(`Desativar o cliente ${client.name}?`)) return;
    try {
      await api.deleteClient(client.id);
      loadClients();
    } catch (error: any) {
      // console.error('Erro ao desativar cliente:', error);
      if (error.response?.status === 401) {
        alert('Sessão expirada. Por favor, faça login novamente.');
        // Admin CRM removido - apenas logar erro
        // console.error('Sessão expirada');
      }
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Clientes</h2>
          <p className="text-sm text-gray-400">Cadastre e edite clientes para associar usuários e webhooks.</p>
        </div>
        <button
          onClick={() => {
            setEditingClient(null);
            setFormData({
              name: '',
              email: '',
              phone: '',
              company_name: '',
              is_active: true
            });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-brand-red text-white rounded-lg hover:bg-brand-red/80 transition-colors"
        >
          <Plus size={20} />
          Novo Cliente
        </button>
      </div>

      <div className="bg-brand-gray rounded-lg border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Nome</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Empresa</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Telefone</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Usuários</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-t border-white/10">
                <td className="px-4 py-3 font-medium">{client.name}</td>
                <td className="px-4 py-3">{client.email}</td>
                <td className="px-4 py-3">{client.company_name || '-'}</td>
                <td className="px-4 py-3">{client.phone || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-300">{client.user_count ?? '-'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    client.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {client.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(client)}
                      className="p-2 text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleToggleActive(client)}
                      className={`p-2 rounded transition-colors ${
                        client.is_active ? 'text-yellow-400 hover:bg-yellow-500/20' : 'text-green-400 hover:bg-green-500/20'
                      }`}
                      title={client.is_active ? 'Desativar' : 'Ativar'}
                    >
                      {client.is_active ? <X size={16} /> : <Edit size={16} />}
                    </button>
                    <button
                      onClick={() => handleDeactivate(client)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                      title="Soft delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-brand-gray border border-white/10 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">{editingClient ? 'Editar Cliente' : 'Novo Cliente'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-brand-dark border border-white/10 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-brand-dark border border-white/10 rounded px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Telefone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-brand-dark border border-white/10 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Empresa</label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    className="w-full bg-brand-dark border border-white/10 rounded px-3 py-2"
                  />
                </div>
              </div>
              {editingClient && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active_client"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="is_active_client" className="text-sm">Ativo</label>
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingClient(null);
                  }}
                  className="px-4 py-2 bg-gray-500/20 text-gray-400 rounded hover:bg-gray-500/30"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-red text-white rounded hover:bg-brand-red/80"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsManagement;
