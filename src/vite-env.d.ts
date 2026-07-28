/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the MDCAS API. Blank in development — Vite proxies /api. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
