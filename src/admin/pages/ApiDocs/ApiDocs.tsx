/**
 * Página de Documentação da API (Swagger UI)
 */

import React from 'react';

export default function ApiDocs() {
  return (
    <div className="h-screen w-full">
      <iframe
        src="https://phdstudio.com.br/api/docs"
        className="w-full h-full border-0"
        title="API Documentation"
        style={{ minHeight: '100vh' }}
      />
    </div>
  );
}

