export function namespaceSvg(svg,prefix,doc=null){
 const Parser=doc?.defaultView?.DOMParser||DOMParser,Serializer=doc?.defaultView?.XMLSerializer||XMLSerializer;const d=new Parser().parseFromString(svg,'image/svg+xml');if(d.querySelector('parsererror'))throw Error('Invalid chapter SVG');const scopes=new Map(),root=d.documentElement;let seq=0;
 const scope=node=>node.ownerSVGElement||root,getScope=node=>{const svgRoot=scope(node);if(!scopes.has(svgRoot))scopes.set(svgRoot,{number:seq++,ids:new Map(),counts:new Map()});return scopes.get(svgRoot);};
 for(const n of d.querySelectorAll('[id]')){const old=n.getAttribute('id'),s=getScope(n),count=s.counts.get(old)||0,next=prefix+'s'+s.number+'-'+old+(count?'-'+count:'');s.counts.set(old,count+1);if(!s.ids.has(old))s.ids.set(old,next);n.setAttribute('id',next);}
 const resolve=(node,id)=>{let s=scope(node);while(s){const mapped=scopes.get(s)?.ids.get(id);if(mapped)return mapped;if(s===root)break;s=s.ownerSVGElement||root;}return id;};
 for(const n of d.querySelectorAll('*'))for(const a of [...n.attributes]){if(a.name==='id')continue;let value=a.value.replace(/url\(#([^)]*)\)/g,(_,id)=>'url(#'+resolve(n,id)+')');if((a.name==='href'||a.name==='xlink:href')&&value.startsWith('#'))value='#'+resolve(n,value.slice(1));if(a.name==='aria-labelledby'||a.name==='aria-describedby')value=value.split(/\s+/).map(id=>resolve(n,id)).join(' ');if(value!==a.value)n.setAttribute(a.name,value);}
 return new Serializer().serializeToString(root);
}
