// Moves a contiguous block of top-level code from src/app.js into src/editor/<name>.js without
// changing behaviour. Scope analysis (eslint-scope) finds every free variable in the block:
//   • names imported by app.js are re-imported from the same module,
//   • names declared in another extracted block are imported from that block's module,
//   • names declared in app.js become `ctx.<name>` (live accessors bound by app.js),
//   • everything else is a browser global and is left alone.
// Top-level declarations still used by app.js are exported and imported back.
// Usage (dev only): npm install --no-save acorn eslint-scope
//   node tools/extract-editor-module.mjs plan.json      (plan: [{name,start,end,title}], start/end = marker strings)
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import * as acorn from 'acorn';
import * as eslintScope from 'eslint-scope';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),appPath=path.join(root,'src/app.js');
const plan=JSON.parse(readFileSync(process.argv[2],'utf8'));
let app=readFileSync(appPath,'utf8');
const parse=code=>acorn.parse(code,{ecmaVersion:'latest',sourceType:'module',ranges:true,allowAwaitOutsideFunction:true});
const analyze=ast=>eslintScope.analyze(ast,{ecmaVersion:2022,sourceType:'module'});
const topNames=ast=>{const out=new Map();for(const n of ast.body){const d=n.type==='ExportNamedDeclaration'?n.declaration:n;if(!d)continue;if(d.type==='FunctionDeclaration'||d.type==='ClassDeclaration')out.set(d.id.name,d);else if(d.type==='VariableDeclaration')for(const v of d.declarations)if(v.id.type==='Identifier')out.set(v.id.name,d);}return out;};
// 1. Cut the blocks.
const blocks=plan.map(b=>{const s=app.indexOf(b.start),e=app.indexOf(b.end,s+1);if(s<0||e<0)throw new Error('Markers not found for '+b.name);return {...b,s,e};}).sort((a,b)=>a.s-b.s);
for(let i=1;i<blocks.length;i++)if(blocks[i].s<blocks[i-1].e)throw new Error('Overlapping blocks');
blocks.forEach(b=>{b.code=app.slice(b.s,b.e);b.hoisted='';});
// State variables that the rest of app.js assigns stay in app.js (hoisted to where the block was);
// the block then reaches them through ctx like any other app state.
let rest;const cutRest=()=>{rest='';let at=0;for(const b of blocks){rest+=app.slice(at,b.s)+b.hoisted;at=b.e;}rest+=app.slice(at);};cutRest();
for(let pass=0;pass<20;pass++){
 const declOf=new Map();for(const b of blocks){const ast=parse(b.code);for(const n of ast.body)if(n.type==='VariableDeclaration'&&n.declarations.every(d=>d.id.type==='Identifier'))for(const d of n.declarations)declOf.set(d.id.name,{b,n});}
 const written=new Set();for(const r of analyze(parse(rest)).globalScope.through)if(r.isWrite()&&declOf.has(r.identifier.name))written.add(r.identifier.name);
 if(!written.size)break;
 const done=new Set();for(const name of written){const {b,n}=declOf.get(name);if(done.has(n.start+':'+b.name))continue;done.add(n.start+':'+b.name);b.hoisted+=b.code.slice(n.start,n.end)+'\n';b.code=b.code.slice(0,n.start)+b.code.slice(n.end);console.error(`Kept in app.js (assigned there): ${n.declarations.map(d=>d.id.name).join(', ')}`);}
 cutRest();
}
// 2. What app.js imports and declares.
const appAst=parse(app),imports=new Map();for(const n of appAst.body)if(n.type==='ImportDeclaration')for(const sp of n.specifiers)imports.set(sp.local.name,{source:n.source.value,imported:sp.type==='ImportSpecifier'?sp.imported.name:'default'});
const restAst=parse(rest),restDecl=topNames(restAst);
const blockDecl=new Map();for(const b of blocks){b.ast=parse(b.code);b.decl=topNames(b.ast);for(const k of b.decl.keys()){if(blockDecl.has(k))throw new Error('Duplicate top-level '+k);blockDecl.set(k,b.name);}}
// 3. Names the remaining app.js still needs from the blocks, and whether it assigns them (not allowed for imports).
const restScope=analyze(restAst),neededByRest=new Map();for(const r of restScope.globalScope.through){const owner=blockDecl.get(r.identifier.name);if(owner){if(r.isWrite())throw new Error(`app.js assigns ${r.identifier.name}, a function or class declared in the block; wrap the assignment in a function inside the block first.`);(neededByRest.get(owner)||neededByRest.set(owner,new Set()).get(owner)).add(r.identifier.name);}}
// 4. Rewrite each block.
const ctxNames=new Map();// name -> written?
for(const b of blocks){const sm=analyze(b.ast),shorthand=new Set();b.alias=/\bctx\b/.test(b.code)?'appCtx':'ctx';const C=b.alias;
 (function walk(n){if(!n||typeof n.type!=='string')return;if(n.type==='Property'&&n.shorthand&&n.value.type==='Identifier')shorthand.add(n.value.start);for(const k of Object.keys(n)){const v=n[k];if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v.type==='string')walk(v);}})(b.ast);
 const edits=[],moduleImports=new Map(),add=(src,imported,local)=>{const m=moduleImports.get(src)||moduleImports.set(src,new Map()).get(src);m.set(local,imported);};
 for(const r of sm.globalScope.through){const name=r.identifier.name;
  if(blockDecl.has(name)){add(`./${blockDecl.get(name)}.js`,name,name);(neededByRest.get(blockDecl.get(name))||neededByRest.set(blockDecl.get(name),new Set()).get(blockDecl.get(name))).add(name);if(r.isWrite())throw new Error(`${b.name} assigns ${name} from another block`);continue;}
  if(imports.has(name)){const im=imports.get(name);if(r.isWrite())throw new Error('Assignment to import '+name);add(im.source.startsWith('./')?'../'+im.source.slice(2):im.source,im.imported,name);continue;}
  if(restDecl.has(name)){ctxNames.set(name,(ctxNames.get(name)||false)||r.isWrite());const id=r.identifier;edits.push([id.start,id.end,shorthand.has(id.start)?`${name}:${C}.${name}`:`${C}.${name}`]);}
 }
 let code=b.code;for(const [s,e,t] of edits.sort((x,y)=>y[0]-x[0]))code=code.slice(0,s)+t+code.slice(e);
 b.moduleImports=moduleImports;b.rewritten=code;}
// 5. Exports (re-parse the rewritten code to place `export`).
for(const b of blocks){const ast=parse(b.rewritten),want=neededByRest.get(b.name)||new Set(),ins=[];for(const n of ast.body){const names=n.type==='FunctionDeclaration'||n.type==='ClassDeclaration'?[n.id.name]:n.type==='VariableDeclaration'?n.declarations.map(d=>d.id.name):[];if(names.some(x=>want.has(x)))ins.push(n.start);}
 let code=b.rewritten;for(const s of ins.sort((x,y)=>y-x))code=code.slice(0,s)+'export '+code.slice(s);
 const importLines=[b.alias==='ctx'?`import {ctx} from './context.js';`:`import {ctx as ${b.alias}} from './context.js';`,...[...b.moduleImports].map(([src,m])=>`import {${[...m].map(([local,imported])=>imported===local?local:`${imported} as ${local}`).join(',')}} from '${src}';`)];
 b.output=`// ${b.title}\n// Extracted from app.js by tools/extract-editor-module.mjs. Shared editor state and helpers come from \`ctx\`, bound in app.js.\n${importLines.join('\n')}\n${code.trim()}\n`;}
// 6. Write modules, context and the slimmer app.js.
mkdirSync(path.join(root,'src/editor'),{recursive:true});
for(const b of blocks)writeFileSync(path.join(root,'src/editor',b.name+'.js'),b.output);
writeFileSync(path.join(root,'src/editor/context.js'),`// Shared editor context for modules split out of app.js. app.js binds live accessors at start-up,\n// so modules always see the current project, UI state and helpers (no copies, no globals).\nexport const ctx={};\nexport function bindEditorContext(api){Object.defineProperties(ctx,Object.getOwnPropertyDescriptors(api));}\n`);
const names=[...ctxNames.keys()].sort(),accessors=names.map(n=>ctxNames.get(n)?`get ${n}(){return ${n};},set ${n}(v){${n}=v;}`:`get ${n}(){return ${n};}`).join(',');
const importBack=blocks.map(b=>{const want=[...(neededByRest.get(b.name)||[])].filter(n=>b.decl.has(n)).sort();return want.length?`import {${want.join(',')}} from './editor/${b.name}.js';`:`import './editor/${b.name}.js';`}).join('\n');
const lastImport=restAst.body.filter(n=>n.type==='ImportDeclaration').pop();
rest=rest.slice(0,lastImport.end)+`${/import \{bindEditorContext\}/.test(rest)?'':"\nimport {bindEditorContext} from './editor/context.js';"}\n${importBack}\nbindEditorContext({${accessors}});`+rest.slice(lastImport.end);
writeFileSync(appPath,rest);
console.log(JSON.stringify({modules:blocks.map(b=>({name:b.name,bytes:b.output.length,exports:[...(neededByRest.get(b.name)||[])].length})),ctx:names.length,writable:names.filter(n=>ctxNames.get(n)),appBytes:rest.length},null,1));
