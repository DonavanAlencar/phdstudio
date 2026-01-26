/**
 * Layout Admin com Sidebar
 */

import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  Tag,
  Activity,
  Kanban,
  Menu,
  X,
  LogOut,
  Settings,
  ChevronRight,
  FileText
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: Users, label: 'Leads', path: '/admin/leads' },
  { icon: Kanban, label: 'Kanban', path: '/admin/kanban' },
  { icon: Activity, label: 'Atividades', path: '/admin/activities' },
  { icon: Tag, label: 'Tags', path: '/admin/tags' },
  { icon: Settings, label: 'Configurações', path: '/admin/settings' },
];

// Menu items apenas para admin
const adminOnlyItems = [
  { icon: FileText, label: 'API Docs', path: '/admin/api-docs', external: true },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    if (confirm('Deseja realmente sair?')) {
      await logout();
      // Admin CRM removido - não redirecionar
      // console.error('Logout realizado');
    }
  };

  // Adicionar classe admin-page ao body e html quando o layout admin é montado
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

  return (
    <div className="min-h-screen bg-gray-50 flex" style={{ backgroundColor: '#f9fafb' }}>
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-900 text-white transition-all duration-300 flex flex-col fixed h-screen`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center w-full'}`}>
            <div className="w-10 h-10 bg-brand-red rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">PHD</span>
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-lg">CRM Admin</h1>
                <p className="text-xs text-gray-400">PHD Studio</p>
              </div>
            )}
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-brand-red text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                } ${!sidebarOpen && 'justify-center'}`}
                title={!sidebarOpen ? item.label : ''}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
                {sidebarOpen && isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}
          
          {/* Separador para itens admin */}
          {user?.role === 'admin' && (
            <>
              {sidebarOpen && <div className="pt-4 pb-2">
                <p className="text-xs text-gray-500 uppercase tracking-wider px-4">Administração</p>
              </div>}
              {adminOnlyItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                if (item.external) {
                  return (
                    <a
                      key={item.path}
                      href="https://phdstudio.com.br/api/docs"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-brand-red text-white'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      } ${!sidebarOpen && 'justify-center'}`}
                      title={!sidebarOpen ? item.label : ''}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {sidebarOpen && <span className="font-medium">{item.label}</span>}
                    </a>
                  );
                }
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-brand-red text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    } ${!sidebarOpen && 'justify-center'}`}
                    title={!sidebarOpen ? item.label : ''}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && <span className="font-medium">{item.label}</span>}
                    {sidebarOpen && isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-800">
          <div className={`flex items-center gap-3 mb-3 ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-10 h-10 bg-brand-red/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-brand-red font-semibold">
                {user?.first_name?.[0] || user?.email?.[0] || 'U'}
              </span>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.first_name && user?.last_name
                    ? `${user.first_name} ${user.last_name}`
                    : user?.email}
                </p>
                <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors ${
              !sidebarOpen && 'justify-center'
            }`}
            title={!sidebarOpen ? 'Sair' : ''}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Sair</span>}
          </button>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-20 w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors border-2 border-gray-900"
        >
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {menuItems.find((item) => location.pathname === item.path || location.pathname.startsWith(item.path + '/'))?.label || 'Dashboard'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {location.pathname}
              </p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

