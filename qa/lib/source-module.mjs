import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { stripTypeScriptTypes } from 'node:module';
const root = resolve(new URL('../../', import.meta.url).pathname),
  cache = new Map();
function moduleURL(file) {
  file = resolve(file);
  if (cache.has(file)) return cache.get(file);
  const source = stripTypeScriptTypes(readFileSync(file, 'utf8')).replace(/from\s+['"]([^'"]+)['"]/g, (all, value) => {
    if (!value.startsWith('.') && !value.startsWith('@/')) return all;
    const next = value.startsWith('@/') ? resolve(root, 'src', value.slice(2)) : resolve(dirname(file), value);
    return 'from ' + JSON.stringify(moduleURL(next.endsWith('.ts') ? next : next + '.ts'));
  });
  const url = 'data:text/javascript;base64,' + Buffer.from(source).toString('base64');
  cache.set(file, url);
  return url;
}
export async function sourceModule(file) {
  return import(moduleURL(resolve(root, file)));
}
