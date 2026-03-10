/**
 * resilientFetch.js
 *
 * Utilitário de HTTP resiliente para chamadas a upstreams externos.
 * Centraliza timeout configurável, 1 retry com backoff para erros transitórios
 * e logs estruturados sem expor segredos.
 */

import axios from 'axios';
import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');

/**
 * Classifica um erro de rede em um código técnico padronizado.
 * @param {Error} err
 * @returns {'UPSTREAM_TIMEOUT'|'DNS_ERROR'|'NETWORK_ERROR'|`HTTP_${number}`|'UNKNOWN_ERROR'}
 */
export function classifyError(err) {
  const code = err.code || '';
  const msg = (err.message || '').toLowerCase();

  if (code === 'ECONNABORTED' || code === 'ETIMEDOUT' || msg.includes('timeout')) {
    return 'UPSTREAM_TIMEOUT';
  }
  if (code === 'ENOTFOUND' || msg.includes('getaddrinfo') || msg.includes('enotfound')) {
    return 'DNS_ERROR';
  }
  if (
    code === 'ECONNREFUSED' ||
    code === 'ECONNRESET' ||
    code === 'ENETUNREACH' ||
    code === 'EHOSTUNREACH'
  ) {
    return 'NETWORK_ERROR';
  }
  if (err.response) {
    return `HTTP_${err.response.status}`;
  }
  return 'UNKNOWN_ERROR';
}

/**
 * Remove segredos (access_token, etc.) de uma URL antes de logar.
 */
function sanitizeUrl(url) {
  return String(url)
    .replace(/access_token=[^&\s]+/gi, 'access_token=***')
    .replace(/client_secret=[^&\s]+/gi, 'client_secret=***');
}

/**
 * Faz um GET resiliente com timeout configurável e retry para erros transitórios.
 *
 * @param {string} url
 * @param {{
 *   timeout?: number,
 *   retries?: number,
 *   retryBackoffMs?: number,
 *   headers?: Record<string,string>,
 *   validateStatus?: (s: number) => boolean,
 *   responseType?: string,
 *   endpointName?: string,
 * }} options
 * @returns {Promise<{ data: any, status: number, durationMs: number }>}
 */
export async function resilientGet(url, options = {}) {
  const {
    timeout = 5000,
    retries = 1,
    retryBackoffMs = 1000,
    headers = {},
    validateStatus,
    responseType,
    endpointName = 'unknown',
  } = options;

  const safeUrl = sanitizeUrl(url);
  let lastErr;

  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, retryBackoffMs * attempt));
    }

    const t0 = Date.now();
    try {
      const response = await axios.get(url, {
        timeout,
        headers: { Accept: 'application/json', ...headers },
        validateStatus: validateStatus || ((s) => s >= 200 && s < 500),
        responseType,
        family: 4,
        lookup: dns.lookup,
        maxRedirects: 5,
      });

      const durationMs = Date.now() - t0;
      console.info(`[${endpointName}] upstream OK`, {
        url: safeUrl,
        status: response.status,
        durationMs,
      });
      return { data: response.data, status: response.status, durationMs };
    } catch (err) {
      const durationMs = Date.now() - t0;
      const reason = classifyError(err);
      err.reason = reason;
      lastErr = err;

      const isTransient = ['UPSTREAM_TIMEOUT', 'DNS_ERROR', 'NETWORK_ERROR'].includes(reason);
      const willRetry = isTransient && attempt < retries;

      console.warn(`[${endpointName}] upstream error`, {
        url: safeUrl,
        attempt: attempt + 1,
        totalAttempts: retries + 1,
        reason,
        code: err.code || '',
        durationMs,
        willRetry,
      });

      if (!willRetry) break;
    }
  }

  throw lastErr;
}
