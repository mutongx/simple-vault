import { Env } from "./worker/types";
import Database from "./worker/db";
import regexIterate from "./common/regexIterate";

const DEFAULT_REGEX = '{([a-zA-Z0-9.:_-]+)}';

export default {

  async processGetAssets(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (request.method != "GET") {
      return null;
    }
    if (path === "/" || path === "/index.html" || path === "/_app.js") {
      if (!env.ASSETS) {
        return new Response("cannot load assets", { status: 501 });
      }
      return env.ASSETS.fetch(request);
    }
    return null;
  },

  async processFillConfiguration(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);
    const path = url.pathname;
    const auth = request.headers.get("Authorization");
    if (request.method != "POST") {
      return null;
    }
    if (path !== "/fill") {
      return null;
    }
    if (!auth) {
      return new Response("forbidden", { status: 403 });
    }
    if (!auth.startsWith("Bearer ")) {
      return new Response("forbidden", { status: 403 });
    }
    const token = auth.substring("Bearer ".length);
    const db = new Database(env);
    const app = await db.getApp(token);
    if (!app) {
      return new Response("forbidden", { status: 403 });
    }
    if (new Date().getTime() / 1000 > app.token_expire_timestamp) {
      return new Response("token expired", { status: 403 });
    }
    const secrets = await db.getSecrets(app);
    const pattern = url.searchParams.get("pattern") || DEFAULT_REGEX;
    const result = [];
    for (const piece of regexIterate(pattern, await request.text())) {
      if (piece.type === "text") {
        result.push(piece.text);
      } else if (piece.type === "match") {
        const splited = piece.match[1].split(":");
        if (splited.length == 3) {
          const [namespace, name, key] = splited;
          if (secrets[namespace] && secrets[namespace][name] && secrets[namespace][name][key]) {
            result.push(secrets[namespace][name][key]);
          } else {
            return new Response(`cannot find secret: ${piece.match[1]}`, { status: 404 });  
          }
        } else {
          return new Response(`unrecognized key: ${piece.match[1]}`, { status: 400 });
        }
      }
    }
    return new Response(result.join(""));
  },

  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    let resp: Response | null = null;
    resp = await this.processGetAssets(request, env, ctx);
    if (resp) {
      return resp;
    }
    resp = await this.processFillConfiguration(request, env, ctx);
    if (resp) {
      return resp;
    }
    return new Response("not found", { status: 404 });
  },
};
