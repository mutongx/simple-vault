import { App, Env, Secret } from "./types";

type SecretStorage = Record<string, Record<string, Record<string, string>>>;

export default class {

  env: Env;

  constructor(env: Env) {
    this.env = env;
  }

  async getApp(token: string) {
    const stmt = this.env.DB.prepare("SELECT * FROM app WHERE token = ?1").bind(token);
    const user = await stmt.first() as App | null;
    return user;
  }

  async getSecrets(app: App): Promise<SecretStorage> {
    const stmt = this.env.DB.prepare("SELECT * FROM secret JOIN access WHERE access.app = ?1 AND access.secret_namespace = secret.namespace AND access.secret_name = secret.name").bind(app.name);
    const result = await stmt.all() as D1Result<Secret>;
    const secrets = result.results;
    const storage: SecretStorage = {}
    for (const secret of secrets) {
      if (storage[secret.namespace] === undefined) {
        storage[secret.namespace] = {}
      }
      if (storage[secret.namespace][secret.name] === undefined) {
        storage[secret.namespace][secret.name] = {}
      }
      storage[secret.namespace][secret.name][secret.key] = secret.value;
    }
    return storage;
  }

}
