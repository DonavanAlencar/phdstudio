// Sistema de armazenamento persistente de logs usando IndexedDB
// Mais robusto que localStorage e não é limpo durante deploy

const DB_NAME = 'phdstudio_logs_db';
const DB_VERSION = 1;
const ACCESS_LOGS_STORE = 'access_logs';
const LOGIN_LOGS_STORE = 'login_logs';

interface IDBLog {
  id?: number;
  data: any;
  timestamp: string;
}

// Inicializar IndexedDB
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Criar stores se não existirem
      if (!db.objectStoreNames.contains(ACCESS_LOGS_STORE)) {
        const accessStore = db.createObjectStore(ACCESS_LOGS_STORE, { keyPath: 'id', autoIncrement: true });
        accessStore.createIndex('timestamp', 'timestamp', { unique: false });
        accessStore.createIndex('visitorId', 'data.visitorId', { unique: false });
      }

      if (!db.objectStoreNames.contains(LOGIN_LOGS_STORE)) {
        const loginStore = db.createObjectStore(LOGIN_LOGS_STORE, { keyPath: 'id', autoIncrement: true });
        loginStore.createIndex('timestamp', 'timestamp', { unique: false });
        loginStore.createIndex('username', 'data.username', { unique: false });
      }
    };
  });
};

// Migrar dados do localStorage para IndexedDB
const migrateFromLocalStorage = async (): Promise<void> => {
  try {
    const db = await initDB();

    // Migrar logs de acesso
    const accessLogsKey = 'phdstudio_access_logs';
    const accessLogsStr = localStorage.getItem(accessLogsKey);
    if (accessLogsStr) {
      try {
        const accessLogs = JSON.parse(accessLogsStr);
        const transaction = db.transaction([ACCESS_LOGS_STORE], 'readwrite');
        const store = transaction.objectStore(ACCESS_LOGS_STORE);

        // Verificar se já existe dados no IndexedDB
        const countRequest = store.count();
        countRequest.onsuccess = () => {
          // Só migrar se IndexedDB estiver vazio
          if (countRequest.result === 0 && Array.isArray(accessLogs)) {
            accessLogs.forEach((log: any) => {
              store.add({
                data: log,
                timestamp: log.timestamp || new Date().toISOString()
              });
            });
          }
        };
      } catch (e) {
        // Ignorar erros de parse
      }
    }

    // Migrar logs de login
    const loginLogsKey = 'phdstudio_login_logs';
    const loginLogsStr = localStorage.getItem(loginLogsKey);
    if (loginLogsStr) {
      try {
        const loginLogs = JSON.parse(loginLogsStr);
        const transaction = db.transaction([LOGIN_LOGS_STORE], 'readwrite');
        const store = transaction.objectStore(LOGIN_LOGS_STORE);

        // Verificar se já existe dados no IndexedDB
        const countRequest = store.count();
        countRequest.onsuccess = () => {
          // Só migrar se IndexedDB estiver vazio
          if (countRequest.result === 0 && Array.isArray(loginLogs)) {
            loginLogs.forEach((log: any) => {
              store.add({
                data: log,
                timestamp: log.timestamp || new Date().toISOString()
              });
            });
          }
        };
      } catch (e) {
        // Ignorar erros de parse
      }
    }
  } catch (error) {
    // Se IndexedDB não estiver disponível, usar localStorage como fallback
  }
};

// Executar migração uma vez ao carregar
let migrationDone = false;
if (typeof window !== 'undefined' && 'indexedDB' in window) {
  migrateFromLocalStorage().then(() => {
    migrationDone = true;
  }).catch(() => {
    migrationDone = true; // Continuar mesmo se falhar
  });
}

// Salvar log de acesso
export const saveAccessLog = async (logEntry: any): Promise<void> => {
  try {
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      const db = await initDB();
      const transaction = db.transaction([ACCESS_LOGS_STORE], 'readwrite');
      const store = transaction.objectStore(ACCESS_LOGS_STORE);

      // Adicionar novo log
      await new Promise<void>((resolve, reject) => {
        const request = store.add({
          data: logEntry,
          timestamp: logEntry.timestamp || new Date().toISOString()
        });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      // Limitar a 1000 logs (mais que localStorage)
      const countRequest = store.count();
      countRequest.onsuccess = async () => {
        if (countRequest.result > 1000) {
          // Remover logs mais antigos
          const index = store.index('timestamp');
          const getAllRequest = index.getAll();
          getAllRequest.onsuccess = () => {
            const logs = getAllRequest.result as IDBLog[];
            const sortedLogs = logs.sort((a, b) => 
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );
            const toRemove = sortedLogs.slice(0, sortedLogs.length - 1000);
            toRemove.forEach(log => {
              if (log.id) {
                store.delete(log.id);
              }
            });
          };
        }
      };
    } else {
      // Fallback para localStorage
      const logsKey = 'phdstudio_access_logs';
      const existingLogs = JSON.parse(localStorage.getItem(logsKey) || '[]');
      existingLogs.push(logEntry);
      if (existingLogs.length > 100) {
        existingLogs.shift();
      }
      localStorage.setItem(logsKey, JSON.stringify(existingLogs));
    }
  } catch (error) {
    // Fallback para localStorage em caso de erro
    const logsKey = 'phdstudio_access_logs';
    const existingLogs = JSON.parse(localStorage.getItem(logsKey) || '[]');
    existingLogs.push(logEntry);
    if (existingLogs.length > 100) {
      existingLogs.shift();
    }
    localStorage.setItem(logsKey, JSON.stringify(existingLogs));
  }
};

// Salvar log de login
export const saveLoginLog = async (logEntry: any): Promise<void> => {
  try {
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      const db = await initDB();
      const transaction = db.transaction([LOGIN_LOGS_STORE], 'readwrite');
      const store = transaction.objectStore(LOGIN_LOGS_STORE);

      // Adicionar novo log
      await new Promise<void>((resolve, reject) => {
        const request = store.add({
          data: logEntry,
          timestamp: logEntry.timestamp || new Date().toISOString()
        });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      // Limitar a 500 logs
      const countRequest = store.count();
      countRequest.onsuccess = async () => {
        if (countRequest.result > 500) {
          // Remover logs mais antigos
          const index = store.index('timestamp');
          const getAllRequest = index.getAll();
          getAllRequest.onsuccess = () => {
            const logs = getAllRequest.result as IDBLog[];
            const sortedLogs = logs.sort((a, b) => 
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );
            const toRemove = sortedLogs.slice(0, sortedLogs.length - 500);
            toRemove.forEach(log => {
              if (log.id) {
                store.delete(log.id);
              }
            });
          };
        }
      };
    } else {
      // Fallback para localStorage
      const logsKey = 'phdstudio_login_logs';
      const existingLogs = JSON.parse(localStorage.getItem(logsKey) || '[]');
      existingLogs.push(logEntry);
      if (existingLogs.length > 50) {
        existingLogs.shift();
      }
      localStorage.setItem(logsKey, JSON.stringify(existingLogs));
    }
  } catch (error) {
    // Fallback para localStorage em caso de erro
    const logsKey = 'phdstudio_login_logs';
    const existingLogs = JSON.parse(localStorage.getItem(logsKey) || '[]');
    existingLogs.push(logEntry);
    if (existingLogs.length > 50) {
      existingLogs.shift();
    }
    localStorage.setItem(logsKey, JSON.stringify(existingLogs));
  }
};

// Obter logs de acesso
export const getAccessLogs = async (): Promise<any[]> => {
  try {
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      const db = await initDB();
      const transaction = db.transaction([ACCESS_LOGS_STORE], 'readonly');
      const store = transaction.objectStore(ACCESS_LOGS_STORE);

      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const logs = (request.result as IDBLog[]).map(log => log.data);
          resolve(logs);
        };
        request.onerror = () => reject(request.error);
      });
    } else {
      // Fallback para localStorage
      const logsKey = 'phdstudio_access_logs';
      return JSON.parse(localStorage.getItem(logsKey) || '[]');
    }
  } catch (error) {
    // Fallback para localStorage em caso de erro
    const logsKey = 'phdstudio_access_logs';
    return JSON.parse(localStorage.getItem(logsKey) || '[]');
  }
};

// Obter logs de login
export const getLoginLogs = async (): Promise<any[]> => {
  try {
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      const db = await initDB();
      const transaction = db.transaction([LOGIN_LOGS_STORE], 'readonly');
      const store = transaction.objectStore(LOGIN_LOGS_STORE);

      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const logs = (request.result as IDBLog[]).map(log => log.data);
          resolve(logs);
        };
        request.onerror = () => reject(request.error);
      });
    } else {
      // Fallback para localStorage
      const logsKey = 'phdstudio_login_logs';
      return JSON.parse(localStorage.getItem(logsKey) || '[]');
    }
  } catch (error) {
    // Fallback para localStorage em caso de erro
    const logsKey = 'phdstudio_login_logs';
    return JSON.parse(localStorage.getItem(logsKey) || '[]');
  }
};

// Exportar logs (backup)
export const exportLogs = async (): Promise<{ accessLogs: any[], loginLogs: any[] }> => {
  const accessLogs = await getAccessLogs();
  const loginLogs = await getLoginLogs();
  return { accessLogs, loginLogs };
};

// Importar logs (restore)
export const importLogs = async (accessLogs: any[], loginLogs: any[]): Promise<void> => {
  // Limpar logs existentes
  try {
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      const db = await initDB();
      
      // Limpar e restaurar logs de acesso
      const accessTransaction = db.transaction([ACCESS_LOGS_STORE], 'readwrite');
      const accessStore = accessTransaction.objectStore(ACCESS_LOGS_STORE);
      await new Promise<void>((resolve, reject) => {
        const clearRequest = accessStore.clear();
        clearRequest.onsuccess = () => {
          accessLogs.forEach(log => {
            accessStore.add({
              data: log,
              timestamp: log.timestamp || new Date().toISOString()
            });
          });
          resolve();
        };
        clearRequest.onerror = () => reject(clearRequest.error);
      });

      // Limpar e restaurar logs de login
      const loginTransaction = db.transaction([LOGIN_LOGS_STORE], 'readwrite');
      const loginStore = loginTransaction.objectStore(LOGIN_LOGS_STORE);
      await new Promise<void>((resolve, reject) => {
        const clearRequest = loginStore.clear();
        clearRequest.onsuccess = () => {
          loginLogs.forEach(log => {
            loginStore.add({
              data: log,
              timestamp: log.timestamp || new Date().toISOString()
            });
          });
          resolve();
        };
        clearRequest.onerror = () => reject(clearRequest.error);
      });
    }
  } catch (error) {
    // Fallback para localStorage
    localStorage.setItem('phdstudio_access_logs', JSON.stringify(accessLogs));
    localStorage.setItem('phdstudio_login_logs', JSON.stringify(loginLogs));
  }
};



