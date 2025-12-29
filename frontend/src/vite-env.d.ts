/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_FRONTEND_URL?: string;
  // Add more env variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
  readonly url: string;
}

// Vite provides ImportMeta interface, we just need to augment ImportMetaEnv

