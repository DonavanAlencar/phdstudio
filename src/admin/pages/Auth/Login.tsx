/**
 * Página de Login
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirecionar se já estiver autenticado
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Adicionar classe admin-page ao body e html quando a página de login é montada
  React.useEffect(() => {
    const body = document.body;
    const html = document.documentElement;
    
    body.classList.add('admin-page');
    html.classList.add('admin-page');
    
    // Forçar fundo transparente com !important via setProperty
    body.style.setProperty('background-color', 'transparent', 'important');
    body.style.setProperty('background', 'transparent', 'important');
    html.style.setProperty('background-color', 'transparent', 'important');
    
    const root = document.getElementById('root');
    if (root) {
      root.style.setProperty('background-color', 'transparent', 'important');
      root.style.setProperty('background', 'transparent', 'important');
    }
    
    return () => {
      body.classList.remove('admin-page');
      html.classList.remove('admin-page');
      body.style.removeProperty('background-color');
      body.style.removeProperty('background');
      html.style.removeProperty('background-color');
      if (root) {
        root.style.removeProperty('background-color');
        root.style.removeProperty('background');
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validação básica no frontend
    if (!email || !email.includes('@')) {
      setError('Por favor, informe um email válido.');
      setLoading(false);
      return;
    }

    if (!password || password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      setLoading(false);
      return;
    }

    try {
      await login(email.trim().toLowerCase(), password);
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error('Erro no login:', err);
      // Tratar erros de validação especificamente
      if (err.response?.status === 400) {
        const errors = err.response?.data?.errors || [];
        if (errors.length > 0) {
          const errorMessages = errors.map((e: any) => e.msg).join(', ');
          setError(errorMessages || 'Dados inválidos. Verifique email e senha.');
        } else {
          setError(err.response?.data?.message || 'Dados inválidos. Verifique email e senha.');
        }
      } else if (err.response?.status === 401) {
        setError('Email ou senha incorretos.');
      } else {
        setError(err.response?.data?.message || 'Erro ao fazer login. Verifique suas credenciais.');
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4" style={{ background: 'linear-gradient(to bottom right, #111827, #1f2937, #111827)' }}>
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          {/* Logo e Título */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-red/20 rounded-full mb-4">
              <LogIn className="w-8 h-8 text-brand-red" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">PHD Studio CRM</h1>
            <p className="text-gray-400">Faça login para acessar o painel administrativo</p>
            <p className="text-xs text-gray-500 mt-2">
              Use seu email cadastrado (ex: admin@phdstudio.com.br)
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
                  placeholder="admin@phdstudio.com.br"
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Botão Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-red text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Entrar
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-400">
            <p>Versão 1.0.0 - PHD Studio</p>
          </div>
        </div>
      </div>
    </div>
  );
}

