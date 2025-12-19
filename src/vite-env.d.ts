/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CHAT_WEBHOOK_URL?: string;
  readonly VITE_CHAT_AUTH_TOKEN?: string;
  readonly VITE_EMAILJS_SERVICE_ID?: string;
  readonly VITE_EMAILJS_TEMPLATE_ID?: string;
  readonly VITE_EMAILJS_PUBLIC_KEY?: string;
  readonly VITE_RECIPIENT_EMAIL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

