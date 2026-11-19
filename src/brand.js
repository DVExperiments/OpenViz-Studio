// V3.54 organisation theme packages ("brand kits").
// A package bundles a visual style, a series palette, fonts and footer branding (byline, note, logo)
// so a team can apply one consistent look to every chart, and share it as a small JSON file.
// Packages never contain data, mappings or chart content. Everything is validated on import.
import {cleanStyle} from './themes.js';
export const BRAND_FORMAT='openviz-theme',BRAND_VERSION=1;
const hex=v=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v);
const text=(v,max)=>typeof v==='string'?v.replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,max):'';
const LOGO_RE=/^data:image\/(png|jpeg|webp|svg\+xml);base64,[A-Za-z0-9+/=]+$/;
export const LOGO_MAX_CHARS=420000; // ~300 KB of image data
export function normalizeLogo(logo){
 if(!logo||typeof logo!=='object'||typeof logo.dataUri!=='string'||!LOGO_RE.test(logo.dataUri)||logo.dataUri.length>LOGO_MAX_CHARS)return null;
 const aspect=Number(logo.aspect);
 return {dataUri:logo.dataUri,aspect:Number.isFinite(aspect)&&aspect>=.1&&aspect<=12?aspect:3,height:Math.max(12,Math.min(60,Math.round(Number(logo.height)||24))),position:logo.position==='left'?'left':'right'};
}
export function normalizeBrand(raw){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('Not an OpenViz theme package.');
 if(raw.format!==undefined&&raw.format!==BRAND_FORMAT)throw new Error('Not an OpenViz theme package.');
 if(raw.version!==undefined&&raw.version!==BRAND_VERSION)throw new Error('This theme package version is not supported.');
 const palette=(Array.isArray(raw.palette)?raw.palette:[]).filter(hex).map(v=>v.toLowerCase()).slice(0,10);
 const style=cleanStyle(raw.style||{});for(const k of ['marginTop','marginRight','marginBottom','marginLeft','legendPosition','barWidthRatio','xLabelRotation'])delete style[k];
 if(palette[0])style.color=palette[0];if(palette[1])style.secondary=palette[1];
 return {format:BRAND_FORMAT,version:BRAND_VERSION,id:text(raw.id,60)||'brand-'+Math.random().toString(36).slice(2,10),name:text(raw.name,80)||'Organisation theme',
  style,palette,byline:text(raw.byline,90),footerNote:text(raw.footerNote,120),defaultSource:text(raw.defaultSource,200),logo:normalizeLogo(raw.logo),applyToNew:raw.applyToNew!==false,updatedAt:typeof raw.updatedAt==='string'?raw.updatedAt.slice(0,40):new Date().toISOString()};
}
// Copies the package onto one chart. Chart data, mappings, titles and annotations are untouched.
export function applyBrand(chart,brand,{overwriteSource=false}={}){
 const b=normalizeBrand(brand);
 Object.assign(chart,b.style);
 if(b.palette.length)chart.palette=[...b.palette];else delete chart.palette;
 chart.brand={id:b.id,name:b.name,byline:b.byline,footerNote:b.footerNote,logo:b.logo};
 if(b.defaultSource&&(overwriteSource||!chart.sourceNote))chart.sourceNote=b.defaultSource;
 chart.brandSeen=b.id;
 return chart;
}
export function removeBrand(chart){delete chart.brand;delete chart.palette;return chart;}
export function brandPackageJson(brand){const b=normalizeBrand(brand);return JSON.stringify({...b,exportedAt:new Date().toISOString()},null,2);}
export function chartPalette(s){return Array.isArray(s?.palette)?s.palette.filter(hex).slice(0,10):[];}
// Footer height reserved at the bottom of a chart for byline/logo.
export function brandFooterHeight(s){const b=s?.brand;if(!b||typeof b!=='object')return 0;const logo=normalizeLogo(b.logo);if(!logo&&!text(b.byline,90)&&!text(b.footerNote,120))return 0;return Math.max(logo?logo.height:0,14)+10;}
export function brandFooterSvg(s,{width,height,pad,font,T,G,esc}){
 const h=brandFooterHeight(s);if(!h)return '';const b=s.brand,logo=normalizeLogo(b.logo),y0=height-h,baseline=height-Math.max(8,(h-12)/2);
 const words=[text(b.byline,90),text(b.footerNote,120)].filter(Boolean).join('  ·  ');let out=`<g data-viz-part="brand-footer"><line x1="${pad}" x2="${width-pad}" y1="${y0}" y2="${y0}" stroke="${G}" stroke-width="1"/>`;
 let textX=pad,anchor='start',logoW=0;
 if(logo){logoW=Math.min(width*.35,logo.height*logo.aspect);const lx=logo.position==='left'?pad:width-pad-logoW;out+=`<image href="${logo.dataUri}" x="${lx}" y="${height-logo.height-5}" width="${logoW}" height="${logo.height}" preserveAspectRatio="xMidYMid meet"><title>${esc(b.name||'Logo')}</title></image>`;if(logo.position==='left')textX=pad+logoW+12;}
 if(words)out+=`<text x="${textX}" y="${baseline}" text-anchor="${anchor}" font-size="11" fill="${T}" fill-opacity=".72" font-family="${font}">${esc(words)}</text>`;
 return out+'</g>';
}
export function brandExample(){return normalizeBrand({format:BRAND_FORMAT,version:BRAND_VERSION,id:'example-harbour',name:'Harbour Analytics (example)',palette:['#1f4e79','#e07a2e','#4a9d8f','#a23b72','#8a8f3d','#6c757d'],style:{background:'#ffffff',textColor:'#1b2733',titleColor:'#1b2733',labelColor:'#1b2733',axisColor:'#6b7785',gridColor:'#e3e8ee',font:'Georgia, serif',titleWeight:700,titleSize:26,gridDash:'solid',barRadius:1},byline:'Chart: Harbour Analytics',footerNote:'harbour.example',defaultSource:'Harbour Analytics survey, 2026',applyToNew:true});}
// V3.55: HTML branding for dashboards and editorial tables (charts carry their own SVG footer).
const escHtml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function brandHtmlHeader(b){const logo=normalizeLogo(b?.logo);return logo?`<div class="ov-brand-head"><img src="${logo.dataUri}" alt="${escHtml(text(b.name,80)||'Logo')}" style="height:${logo.height}px;width:auto"></div>`:'';}
export function brandHtmlFooter(b,{withLogo=false}={}){if(!b||typeof b!=='object')return '';const logo=withLogo?normalizeLogo(b.logo):null,words=[text(b.byline,90),text(b.footerNote,120)].filter(Boolean).join(' · ');if(!words&&!logo)return '';return `<footer class="ov-brand-foot"><span>${escHtml(words)}</span>${logo?`<img src="${logo.dataUri}" alt="${escHtml(text(b.name,80)||'Logo')}" style="height:${Math.min(logo.height,28)}px;width:auto">`:''}</footer>`;}
export const brandHtmlCss='.ov-brand-head{display:flex;justify-content:flex-end;margin:0 0 6px}.ov-brand-head img{display:block;max-width:240px}.ov-brand-foot{display:flex;justify-content:space-between;align-items:center;gap:12px;border-top:1px solid color-mix(in srgb,currentColor 18%,transparent);margin-top:14px;padding-top:8px;font-size:12px;opacity:.8}.ov-brand-foot img{display:block}';
export function brandSlideTokens(brand){const b=normalizeBrand(brand),st=b.style;return {background:st.background||'#ffffff',textColor:st.textColor||'#1c2c3e',font:st.font||'Arial, sans-serif',accent:b.palette[0]||st.color||'#0d9488',secondary:b.palette[1]||st.secondary||'#f2aa64'};}
// V3.58 organisation logo on slides. Placement is in slide percentages (slides are 16:9), so the
// editor, PPTX, PDF and printable exports all put the logo in the same place.
export const SLIDE_LOGO_POSITIONS=[['off','Off'],['top-right','Top right'],['top-left','Top left'],['bottom-right','Bottom right'],['bottom-left','Bottom left']];
export function slideLogoPlacement(project,slide){
 const cfg=project?.slideLogo,pos=cfg?.position;if(!pos||pos==='off'||slide?.hideLogo||!SLIDE_LOGO_POSITIONS.some(([v])=>v===pos))return null;
 const logo=normalizeLogo(project?.brand?.logo);if(!logo)return null;
 const margin=3;let h=Math.max(3,Math.min(20,Number(cfg.size)||8)),w=h*logo.aspect*9/16;
 if(w>40){h=h*40/w;w=40;}
 const x=pos.endsWith('left')?margin:100-margin-w,y=pos.startsWith('top')?margin*16/9:100-margin*16/9-h;
 const r=v=>Math.round(v*100)/100;return {dataUri:logo.dataUri,x:r(x),y:r(y),w:r(w),h:r(h),position:pos};
}
