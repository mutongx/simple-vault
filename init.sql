CREATE TABLE IF NOT EXISTS app (name TEXT, token TEXT, token_expire_timestamp INTEGER, encrypt_key TEXT);
CREATE TABLE IF NOT EXISTS secret (namespace TEXT, name TEXT, key TEXT, value TEXT, encrypt_key TEXT, encrypt_key_app TEXT);
CREATE TABLE IF NOT EXISTS access (app TEXT, secret_namespace TEXT, secret_name TEXT);

CREATE UNIQUE INDEX IF NOT EXISTS constraint__app__name ON app (name);
CREATE UNIQUE INDEX IF NOT EXISTS constraint__app__token ON app (token);
CREATE UNIQUE INDEX IF NOT EXISTS constraint__secret__namespace__name__key ON secret (namespace, name, key);
CREATE UNIQUE INDEX IF NOT EXISTS constraint__access__app__secret ON access (app, secret_namespace, secret_name);
