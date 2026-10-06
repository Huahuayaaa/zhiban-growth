const bindings=new URL('./bindings.mjs',import.meta.url).href;
export async function resolve(specifier,context,nextResolve){
  if(specifier==='cloudflare:workers')return {url:bindings,shortCircuit:true};
  return nextResolve(specifier,context);
}
