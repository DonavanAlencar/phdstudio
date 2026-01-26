import React from 'react';
import { Navigate } from 'react-router-dom';
import MobileChatPage from '../MobileChat/MobileChatPage';

const ClientArea: React.FC = () => {
  const userRole = localStorage.getItem('userRole');
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (userRole !== 'client') {
    return <Navigate to="/" replace />;
  }

  // Clientes têm acesso apenas ao mobilechat
  return <MobileChatPage />;
};

export default ClientArea;
