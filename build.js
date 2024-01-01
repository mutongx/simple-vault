const esbuild = require("esbuild");

async function build() {
  await esbuild.build({
    entryPoints: ["./src/_worker.ts"],
    bundle: true,
    outdir: "dist",
    platform: "node",
    format: "esm",
    sourcemap: true,
    minify: true,
  });
}

build();
