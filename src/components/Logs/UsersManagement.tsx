import React, { useState, useEffect } from 'react';
import { Plus, Edit, Key, X } from 'lucide-react';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'manager' | 'user' | 'client';
  is_active: boolean;
  last_login: string;
  client_id?: number;
  client_name?: string;
}

const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [clients, setClients] = useState<any[]>([]);

  // Form states
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'user' as User['role'],
    client_id: ''
  });
  const [resetPassword, setResetPassword] = useState('');

  useEffect(() => {
    loadUsers();
    loadClients();
  }, []);

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/crm/v1/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data);
      }
    } catch (error) {
      // console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/crm/v1/clients', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setClients(data.data);
      }
    } catch (error) {
      // console.error('Erro ao carregar clientes:', error);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const payload = {
        ...formData,
        client_id: formData.role === 'client' && formData.client_id ? parseInt(formData.client_id) : undefined
      };

      const response = await fetch('/api/crm/v1/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setShowCreateModal(false);
        setFormData({
          email: '',
          password: '',
          first_name: '',
          last_name: '',
          role: 'user',
          client_id: ''
        });
        loadUsers();
      } else {
        const error = await response.json();
        alert(error.message || 'Erro ao criar usuário');
      }
    } catch (error) {
      // console.error('Erro ao criar usuário:', error);
      alert('Erro ao criar usuário');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !resetPassword) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/crm/v1/users/${selectedUser.id}/reset-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ new_password: resetPassword })
      });

      if (response.ok) {
        setShowResetPasswordModal(false);
        setSelectedUser(null);
        setResetPassword('');
        alert('Senha resetada com sucesso');
      } else {
        const error = await response.json();
        alert(error.message || 'Erro ao resetar senha');
      }
    } catch (error) {
      // console.error('Erro ao resetar senha:', error);
      alert('Erro ao resetar senha');
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/crm/v1/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: !user.is_active })
      });

      if (response.ok) {
        loadUsers();
      }
    } catch (error) {
      // console.error('Erro ao atualizar usuário:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestão de Usuários</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-red text-white rounded-lg hover:bg-brand-red/80 transition-colors"
        >
          <Plus size={20} />
          Criar Usuário
        </button>
      </div>

      <div className="bg-brand-gray rounded-lg border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Nome</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Role</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Cliente</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-white/10">
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">{user.first_name} {user.last_name}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    user.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                    user.role === 'client' ? 'bg-blue-500/20 text-blue-400' :
                    user.role === 'manager' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3">{user.client_name || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    user.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {user.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowResetPasswordModal(true);
                      }}
                      className="p-2 text-yellow-400 hover:bg-yellow-500/20 rounded transition-colors"
                      title="Resetar Senha"
                    >
                      <Key size={16} />
                    </button>
                    <button
                      onClick={() => handleToggleActive(user)}
                      className={`p-2 rounded transition-colors ${
                        user.is_active
                          ? 'text-red-400 hover:bg-red-500/20'
                          : 'text-green-400 hover:bg-green-500/20'
                      }`}
                      title={user.is_active ? 'Desativar' : 'Ativar'}
                    >
                      {user.is_active ? <X size={16} /> : <Edit size={16} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Criar Usuário */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-brand-gray border border-white/10 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Criar Usuário</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
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
              <div>
                <label className="block text-sm font-medium mb-1">Senha *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-brand-dark border border-white/10 rounded px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full bg-brand-dark border border-white/10 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Sobrenome</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full bg-brand-dark border border-white/10 rounded px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role *</label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
                  className="w-full bg-brand-dark border border-white/10 rounded px-3 py-2"
                >
                  <option value="user">User</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                  <option value="client">Client</option>
                </select>
              </div>
              {formData.role === 'client' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Cliente</label>
                  <select
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                    className="w-full bg-brand-dark border border-white/10 rounded px-3 py-2"
                  >
                    <option value="">Selecione um cliente</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name} ({client.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-500/20 text-gray-400 rounded hover:bg-gray-500/30"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-red text-white rounded hover:bg-brand-red/80"
                >
                  Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Resetar Senha */}
      {showResetPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-brand-gray border border-white/10 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Resetar Senha</h3>
            <p className="text-sm text-gray-400 mb-4">Usuário: {selectedUser.email}</p>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nova Senha *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  className="w-full bg-brand-dark border border-white/10 rounded px-3 py-2"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetPasswordModal(false);
                    setSelectedUser(null);
                    setResetPassword('');
                  }}
                  className="px-4 py-2 bg-gray-500/20 text-gray-400 rounded hover:bg-gray-500/30"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-red text-white rounded hover:bg-brand-red/80"
                >
                  Resetar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
