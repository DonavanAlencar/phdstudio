import React, { useState, useEffect } from 'react';
import { Plus, Edit, Link as LinkIcon } from 'lucide-react';

interface Client {
  id: number;
  name: string;
  email: string;
  company_name?: string;
}

interface MobilechatConfig {
  id: number;
  client_id: number;
  client_name: string;
  client_email: string;
  n8n_webhook_url: string;
  n8n_auth_token?: string;
  is_active: boolean;
}

const MobilechatConfigsManagement: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [configs, setConfigs] = useState<MobilechatConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    client_id: '',
    n8n_webhook_url: '',
    n8n_auth_token: '',
    is_active: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      // Carregar clientes
      const clientsResponse = await fetch('/api/crm/v1/clients', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (clientsResponse.ok) {
        const clientsData = await clientsResponse.json();
        setClients(clientsData.data);
        
        // Carregar configurações
        const configsPromises = clientsData.data.map(async (client: Client) => {
          const configResponse = await fetch(`/api/crm/v1/client-mobilechat/${client.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (configResponse.ok) {
            const configData = await configResponse.json();
            return {
              ...configData.data,
              client_name: client.name,
              client_email: client.email
            };
          }
          return null;
        });

        const configsResults = await Promise.all(configsPromises);
        setConfigs(configsResults.filter(c => c !== null) as MobilechatConfig[]);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/crm/v1/client-mobilechat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_id: parseInt(formData.client_id),
          n8n_webhook_url: formData.n8n_webhook_url,
          n8n_auth_token: formData.n8n_auth_token || undefined,
          is_active: formData.is_active
        })
      });

      if (response.ok) {
        setShowModal(false);
        setFormData({
          client_id: '',
          n8n_webhook_url: '',
          n8n_auth_token: '',
          is_active: true
        });
        loadData();
      } else {
        const error = await response.json();
        alert(error.message || 'Erro ao salvar configuração');
      }
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      alert('Erro ao salvar configuração');
    }
  };

  const handleEdit = (config: MobilechatConfig) => {
    setFormData({
      client_id: config.client_id.toString(),
      n8n_webhook_url: config.n8n_webhook_url,
      n8n_auth_token: config.n8n_auth_token || '',
      is_active: config.is_active
    });
    setShowModal(true);
  };

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Configurações de Mobilechat</h2>
        <button
          onClick={() => {
            setFormData({
              client_id: '',
              n8n_webhook_url: '',
              n8n_auth_token: '',
              is_active: true
            });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-brand-red text-white rounded-lg hover:bg-brand-red/80 transition-colors"
        >
          <Plus size={20} />
          Nova Configuração
        </button>
      </div>

      <div className="grid gap-4">
        {configs.map((config) => (
          <div key={config.id} className="bg-brand-gray border border-white/10 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{config.client_name}</h3>
                <p className="text-sm text-gray-400">{config.client_email}</p>
                <div className="mt-2 flex items-center gap-2">
                  <LinkIcon size={16} className="text-gray-400" />
                  <a
                    href={config.n8n_webhook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:underline break-all"
                  >
                    {config.n8n_webhook_url}
                  </a>
                </div>
                <div className="mt-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    config.is_active
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {config.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleEdit(config)}
                className="p-2 text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
                title="Editar"
              >
                <Edit size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-brand-gray border border-white/10 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Configuração de Mobilechat</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Cliente *</label>
                <select
                  required
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  className="w-full bg-brand-dark border border-white/10 rounded px-3 py-2"
                  disabled={!!formData.client_id && configs.some(c => c.client_id.toString() === formData.client_id)}
                >
                  <option value="">Selecione um cliente</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} ({client.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">URL do Webhook n8n *</label>
                <input
                  type="url"
                  required
                  value={formData.n8n_webhook_url}
                  onChange={(e) => setFormData({ ...formData, n8n_webhook_url: e.target.value })}
                  className="w-full bg-brand-dark border border-white/10 rounded px-3 py-2"
                  placeholder="https://n8n.example.com/webhook/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Token de Autenticação (opcional)</label>
                <input
                  type="text"
                  value={formData.n8n_auth_token}
                  onChange={(e) => setFormData({ ...formData, n8n_auth_token: e.target.value })}
                  className="w-full bg-brand-dark border border-white/10 rounded px-3 py-2"
                  placeholder="Token de autenticação do webhook"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="is_active" className="text-sm">Ativo</label>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({
                      client_id: '',
                      n8n_webhook_url: '',
                      n8n_auth_token: '',
                      is_active: true
                    });
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

export default MobilechatConfigsManagement;
