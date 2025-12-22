/**
 * Rotas do Admin CRM
 */

import React from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AdminLayout from './components/Layout/AdminLayout';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import Login from './pages/Auth/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import LeadsList from './pages/Leads/LeadsList';
import LeadForm from './pages/Leads/LeadForm';
import LeadDetail from './pages/Leads/LeadDetail';
import KanbanBoard from './pages/Kanban/KanbanBoard';
import ActivitiesList from './pages/Activities/ActivitiesList';
import ActivityForm from './pages/Activities/ActivityForm';
import TagsList from './pages/Tags/TagsList';

function AdminLayoutWrapper() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}

export default function AdminRoutes() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route
          element={
            <ProtectedRoute>
              <AdminLayoutWrapper />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="leads" element={<LeadsList />} />
          <Route path="leads/new" element={<LeadForm />} />
          <Route path="leads/:id" element={<LeadDetail />} />
          <Route path="leads/:id/edit" element={<LeadForm />} />
          <Route path="kanban" element={<KanbanBoard />} />
          <Route path="activities" element={<ActivitiesList />} />
          <Route path="activities/new" element={<ActivityForm />} />
          <Route path="tags" element={<TagsList />} />
          <Route path="settings" element={<div className="p-6">Configurações - Em desenvolvimento</div>} />
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

