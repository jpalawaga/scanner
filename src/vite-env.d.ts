/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

declare const __APP_BUILD_VERSION__: string;
declare const __APP_BUILD_STAMP__: string;

interface ImportMetaEnv {
  readonly VITE_ENRICHMENT_PROXY_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
