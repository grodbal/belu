import { access } from "node:fs/promises";
import { resolve as pathResolve } from "node:path";
import { pathToFileURL } from "node:url";

async function firstExisting(candidates) {
  for (const candidate of candidates) {
    try {
      await access(candidate);
      return pathToFileURL(candidate).href;
    } catch {
      // Try the next TypeScript module shape.
    }
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier === "server-only") {
    const url = await firstExisting([
      pathResolve(process.cwd(), "node_modules/next/dist/compiled/server-only/empty.js"),
    ]);
    if (url) return { url, shortCircuit: true };
  }

  if (specifier.startsWith("@/")) {
    const base = pathResolve(process.cwd(), specifier.slice(2));
    const url = await firstExisting([`${base}.ts`, `${base}.tsx`, pathResolve(base, "index.ts")]);
    if (url) return { url, shortCircuit: true };
  }

  return nextResolve(specifier, context);
}
