export default async function loadModule(moduleName) {
  if (!moduleName) return null;
  const m = await import(moduleName);
  return m;
}
