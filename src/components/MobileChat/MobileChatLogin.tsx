import React, { useState, useEffect } from 'react';
import { LogIn, Lock, AlertCircle } from 'lucide-react';
import { saveLoginLog } from '../../utils/logsStorage';
import { getVisitorIP } from '../../utils/mobileChatUtils';

interface MobileChatLoginProps {
  onLoginSuccess: () => void;
}

const MobileChatLogin: React.FC<MobileChatLoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);

  // Verificar tentativas falhadas anteriores
  useEffect(() => {
    const stored = sessionStorage.getItem('mobile_chat_failed_attempts');
    if (stored) {
      setFailedAttempts(parseInt(stored, 10));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const location = window.location.pathname;
    const userAgent = navigator.userAgent;
    const timestamp = new Date().toISOString();
    
    // Obter IP de forma não bloqueante (usa 'unknown' como padrão)
    // Não aguardar - usar 'unknown' e tentar obter em background
    const ip = 'unknown';
    
    // Tentar obter IP em background (não bloqueia o login)
    getVisitorIP().catch(() => {
      // Silenciar erros completamente
    });

    try {
      // Validação admin
      if (username === 'phdstudioadmin' && password === 'phd@studio!@admin') {
        // Login bem-sucedido
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('username', 'phdstudioadmin');
        localStorage.setItem('userRole', 'admin');

        // Limpar tentativas falhadas
        sessionStorage.removeItem('mobile_chat_failed_attempts');
        setFailedAttempts(0);

        // Registrar login bem-sucedido
        await saveLoginLog({
          username: 'phdstudioadmin',
          ip,
          timestamp,
          userAgent,
          success: true,
          location
        }).catch(() => {
          // Silenciar erros de logging
        });

        onLoginSuccess();
        return;
      }

      // Validação usuário vexin
      if (username === 'vexin' && password === '@v3xiN!') {
        // Login bem-sucedido
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('username', 'vexin');
        localStorage.setItem('userRole', 'client');

        // Limpar tentativas falhadas
        sessionStorage.removeItem('mobile_chat_failed_attempts');
        setFailedAttempts(0);

        // Registrar login bem-sucedido
        await saveLoginLog({
          username: 'vexin',
          ip,
          timestamp,
          userAgent,
          success: true,
          location
        }).catch(() => {
          // Silenciar erros de logging
        });

        onLoginSuccess();
        return;
      }

      // Login falhou
      const newFailedAttempts = failedAttempts + 1;
      setFailedAttempts(newFailedAttempts);
      sessionStorage.setItem('mobile_chat_failed_attempts', newFailedAttempts.toString());

      // Registrar tentativa de login falhada
      await saveLoginLog({
        username,
        ip,
        timestamp,
        userAgent,
        success: false,
        location
      }).catch(() => {
        // Silenciar erros de logging
      });

      // Alertar sobre múltiplas tentativas
      if (newFailedAttempts >= 3) {
        setError('Múltiplas tentativas de login falhadas. Por favor, verifique suas credenciais.');
      } else {
        setError('Usuário ou senha incorretos');
      }
    } catch (err) {
      setError('Erro ao processar login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4" 
      style={{ 
        height: '100vh', 
        width: '100vw', 
        margin: 0, 
        padding: '1rem',
        backgroundColor: '#0A0A0A', // brand-dark fallback
        minHeight: '100vh',
        minWidth: '100vw'
      }}
    >
      <div className="w-full max-w-md">
        <div 
          className="rounded-2xl p-8 shadow-2xl"
          style={{
            backgroundColor: '#1A1A1A', // brand-gray fallback
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '1rem',
            padding: '2rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
        >
          {/* Logo e Título */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-red/20 rounded-full mb-4 border border-brand-red/20">
              <LogIn className="text-brand-red" size={32} />
            </div>
                <h1 
                  className="mb-2"
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 900,
                    color: '#FFFFFF',
                    fontFamily: 'Montserrat, sans-serif'
                  }}
                >
                  PHD Studio Chat
                </h1>
                <p 
                  style={{
                    color: '#9CA3AF',
                    fontSize: '0.875rem'
                  }}
                >
                  Faça login para acessar o chat
                </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Usuário */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Usuário
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  className="w-full bg-brand-dark border border-white/10 rounded-lg px-4 py-3 pl-12 text-white placeholder-gray-500 focus:outline-none focus:border-brand-red transition-colors"
                  placeholder="Digite seu usuário"
                />
                <LogIn className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full bg-brand-dark border border-white/10 rounded-lg px-4 py-3 pl-12 text-white placeholder-gray-500 focus:outline-none focus:border-brand-red transition-colors"
                  placeholder="Digite sua senha"
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Botão Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              style={{
                backgroundColor: loading ? '#DC2626' : '#EF4444',
                color: '#FFFFFF',
                minHeight: '44px',
                width: '100%',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '1rem'
              }}
            >
              {loading ? (
                <>
                  <div 
                    className="rounded-full animate-spin" 
                    style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderTopColor: '#FFFFFF'
                    }}
                  />
                  <span>Entrando...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" style={{ width: '20px', height: '20px' }} />
                  <span>Entrar</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-xs text-gray-500">
            <p>PHD Studio - Chat Mobile</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileChatLogin;

