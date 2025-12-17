import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle, RefreshCw, Copy, Check } from 'lucide-react';

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning' | 'pending';
  message: string;
  details?: string;
}

const ChatDiagnostic: React.FC = () => {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const webhookUrl = import.meta.env.VITE_CHAT_WEBHOOK_URL || 'http://148.230.79.105:5679/webhook/32f58b69-ef50-467f-b884-50e72a5eefa2';
  const authToken = import.meta.env.VITE_CHAT_AUTH_TOKEN || 'T!Hm9Y1Sc#0!F2ZxVZvvS2@#UQ5bqqQKly';

  const updateResult = (test: string, status: DiagnosticResult['status'], message: string, details?: string) => {
    setResults(prev => {
      const existing = prev.find(r => r.test === test);
      if (existing) {
        return prev.map(r => r.test === test ? { ...r, status, message, details } : r);
      }
      return [...prev, { test, status, message, details }];
    });
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);

    // Teste 1: Verificar protocolo da página
    const isHttps = window.location.protocol === 'https:';
    updateResult(
      'Protocolo da Página',
      isHttps ? 'success' : 'warning',
      isHttps ? 'Página carregada via HTTPS' : 'Página carregada via HTTP',
      `Protocolo atual: ${window.location.protocol}`
    );

    // Teste 2: Verificar protocolo do webhook
    let webhookProtocol = 'unknown';
    try {
      const url = new URL(webhookUrl);
      webhookProtocol = url.protocol;
      const isWebhookHttps = url.protocol === 'https:';
      updateResult(
        'Protocolo do Webhook',
        isWebhookHttps ? 'success' : 'error',
        isWebhookHttps ? 'Webhook usa HTTPS' : 'Webhook usa HTTP',
        `URL: ${url.origin}`
      );
    } catch {
      updateResult(
        'Protocolo do Webhook',
        'error',
        'URL do webhook inválida',
        webhookUrl
      );
    }

    // Teste 3: Detectar Mixed Content
    const isMixedContent = isHttps && webhookProtocol === 'http:';
    if (isMixedContent) {
      updateResult(
        'Mixed Content',
        'error',
        '⚠️ PROBLEMA DETECTADO: Mixed Content bloqueado pelo navegador',
        'Sites HTTPS não podem fazer requisições para servidores HTTP por questões de segurança. O navegador bloqueia automaticamente essas requisições.'
      );
    } else {
      updateResult(
        'Mixed Content',
        'success',
        'Sem problemas de Mixed Content detectados'
      );
    }

    // Teste 4: Testar conexão com o webhook
    updateResult('Teste de Conexão', 'pending', 'Testando conexão...');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Authentication': authToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input_text: 'teste de diagnóstico',
          session_id: `diagnostic_${Date.now()}`
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        updateResult(
          'Teste de Conexão',
          'success',
          'Conexão bem-sucedida!',
          `Status: ${response.status} - Resposta recebida: ${data.output ? 'Sim' : 'Não'}`
        );
      } else {
        updateResult(
          'Teste de Conexão',
          'error',
          `Erro HTTP ${response.status}`,
          response.statusText
        );
      }
    } catch (error: any) {
      let errorMsg = 'Erro desconhecido';
      let errorDetails = '';

      if (error.name === 'AbortError') {
        errorMsg = 'Timeout: A requisição demorou mais de 10 segundos';
        errorDetails = 'O servidor pode estar lento ou inacessível';
      } else if (error.message?.includes('Mixed Content') || error.message?.includes('blocked')) {
        errorMsg = 'Bloqueado pelo navegador (Mixed Content)';
        errorDetails = 'O navegador bloqueou a requisição HTTP de uma página HTTPS';
      } else if (error.message?.includes('CORS') || error.message?.includes('cross-origin')) {
        errorMsg = 'Erro CORS';
        errorDetails = 'O servidor não permite requisições de origem cruzada';
      } else if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        errorMsg = 'Falha de rede';
        errorDetails = 'Não foi possível conectar ao servidor';
      } else {
        errorDetails = error.message || error.toString();
      }

      updateResult(
        'Teste de Conexão',
        'error',
        errorMsg,
        errorDetails
      );
    }

    // Teste 5: Verificar variáveis de ambiente
    const hasEnvUrl = !!import.meta.env.VITE_CHAT_WEBHOOK_URL;
    const hasEnvToken = !!import.meta.env.VITE_CHAT_AUTH_TOKEN;
    updateResult(
      'Variáveis de Ambiente',
      hasEnvUrl && hasEnvToken ? 'success' : 'warning',
      hasEnvUrl && hasEnvToken 
        ? 'Variáveis configuradas' 
        : 'Usando valores padrão',
      hasEnvUrl && hasEnvToken 
        ? 'Configuração via .env' 
        : 'Configuração hardcoded no código'
    );

    // Teste 6: Verificar último erro do chat (se houver)
    try {
      const lastError = sessionStorage.getItem('chat_last_error');
      if (lastError) {
        const errorData = JSON.parse(lastError);
        updateResult(
          'Último Erro do Chat',
          'warning',
          `Tipo: ${errorData.type}`,
          `Ocorreu em: ${new Date(errorData.timestamp).toLocaleString('pt-BR')}`
        );
      } else {
        updateResult(
          'Último Erro do Chat',
          'success',
          'Nenhum erro registrado recentemente'
        );
      }
    } catch {
      updateResult(
        'Último Erro do Chat',
        'success',
        'Nenhum erro registrado'
      );
    }

    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const copyResults = () => {
    const report = results.map(r => 
      `${r.test}: ${r.status.toUpperCase()} - ${r.message}${r.details ? ` (${r.details})` : ''}`
    ).join('\n');
    
    navigator.clipboard.writeText(report).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      default:
        return <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />;
    }
  };

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-500/20 border-green-500/30 text-green-400';
      case 'error':
        return 'bg-red-500/20 border-red-500/30 text-red-400';
      case 'warning':
        return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400';
      default:
        return 'bg-gray-500/20 border-gray-500/30 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Diagnóstico do Chat</h1>
          <p className="text-gray-400 mb-6">
            Esta página testa a conexão do assistente virtual e identifica possíveis problemas.
          </p>
          <div className="flex gap-4">
            <button
              onClick={runDiagnostics}
              disabled={isRunning}
              className="px-6 py-3 bg-brand-red hover:bg-red-600 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <RefreshCw className={`w-5 h-5 ${isRunning ? 'animate-spin' : ''}`} />
              {isRunning ? 'Executando testes...' : 'Executar Testes Novamente'}
            </button>
            {results.length > 0 && (
              <button
                onClick={copyResults}
                className="px-6 py-3 bg-brand-gray hover:bg-gray-700 border border-white/10 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {copied ? 'Copiado!' : 'Copiar Relatório'}
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {results.length === 0 && !isRunning && (
            <div className="text-center py-12 text-gray-400">
              Clique em "Executar Testes" para começar
            </div>
          )}

          {results.map((result, index) => (
            <div
              key={index}
              className={`border rounded-lg p-6 ${getStatusColor(result.status)}`}
            >
              <div className="flex items-start gap-4">
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">{result.test}</h3>
                  <p className="mb-2">{result.message}</p>
                  {result.details && (
                    <p className="text-sm opacity-80 mt-2 bg-black/20 p-3 rounded border border-white/10">
                      {result.details}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {results.some(r => r.status === 'error') && (
          <div className="mt-8 p-6 bg-red-500/10 border border-red-500/30 rounded-lg">
            <h3 className="font-bold text-red-400 mb-2">⚠️ Problemas Detectados</h3>
            <p className="text-gray-300 mb-4">
              Foram encontrados problemas que impedem o funcionamento do chat. 
              As soluções mais comuns são:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Mixed Content: Configure o webhook para usar HTTPS ou use um proxy reverso</li>
              <li>CORS: Configure o servidor do webhook para aceitar requisições do seu domínio</li>
              <li>Rede: Verifique se o servidor do webhook está acessível</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatDiagnostic;

