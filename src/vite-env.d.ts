/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the MDCAS API. Blank runs the app standalone. */
  readonly VITE_API_URL?: string;
  /** Forces the data source: 'local' for standalone, 'api' for the backend. */
  readonly VITE_DATA_MODE?: 'local' | 'api';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
