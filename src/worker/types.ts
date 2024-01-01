export interface Env {
  DB: D1Database;
  ASSETS: { fetch: typeof fetch } | undefined;
};

export interface App {
  name: string;
  token: string;
  token_expire_timestamp: number;
}

export interface Secret {
  namespace: string,
  name: string,
  key: string,
  value: string,
}
