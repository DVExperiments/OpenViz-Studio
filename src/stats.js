// V3.56 statistics helpers: regression forecasts with prediction intervals, and k-means clustering.
// Everything is deterministic (seeded), dependency-free and documented in the chart tooltips.

// ---------- Student t distribution ----------
function logGamma(x){const c=[76.18009172947146,-86.50532032941677,24.01409824083091,-1.231739572450155,.1208650973866179e-2,-.5395239384953e-5];let y=x,tmp=x+5.5;tmp-=(x+.5)*Math.log(tmp);let ser=1.000000000190015;for(const v of c)ser+=v/++y;return -tmp+Math.log(2.5066282746310005*ser/x);}
function betacf(a,b,x){const MAXIT=200,EPS=3e-14,FPMIN=1e-300;let qab=a+b,qap=a+1,qam=a-1,c=1,d=1-qab*x/qap;if(Math.abs(d)<FPMIN)d=FPMIN;d=1/d;let h=d;for(let m=1;m<=MAXIT;m++){const m2=2*m;let aa=m*(b-m)*x/((qam+m2)*(a+m2));d=1+aa*d;if(Math.abs(d)<FPMIN)d=FPMIN;c=1+aa/c;if(Math.abs(c)<FPMIN)c=FPMIN;d=1/d;h*=d*c;aa=-(a+m)*(qab+m)*x/((a+m2)*(qap+m2));d=1+aa*d;if(Math.abs(d)<FPMIN)d=FPMIN;c=1+aa/c;if(Math.abs(c)<FPMIN)c=FPMIN;d=1/d;const del=d*c;h*=del;if(Math.abs(del-1)<EPS)break;}return h;}
function incBeta(a,b,x){if(x<=0)return 0;if(x>=1)return 1;const bt=Math.exp(logGamma(a+b)-logGamma(a)-logGamma(b)+a*Math.log(x)+b*Math.log(1-x));return x<(a+1)/(a+b+2)?bt*betacf(a,b,x)/a:1-bt*betacf(b,a,1-x)/b;}
export function tCdf(t,df){const x=df/(df+t*t),p=.5*incBeta(df/2,.5,x);return t>=0?1-p:p;}
export function tQuantile(p,df){if(!(df>0))return NaN;let lo=-1000,hi=1000;for(let i=0;i<200;i++){const mid=(lo+hi)/2;if(tCdf(mid,df)<p)lo=mid;else hi=mid;}return (lo+hi)/2;}

// ---------- least squares ----------
function invert(M){const n=M.length,A=M.map((r,i)=>[...r,...Array.from({length:n},(_,j)=>i===j?1:0)]);for(let c=0;c<n;c++){let piv=c;for(let r=c+1;r<n;r++)if(Math.abs(A[r][c])>Math.abs(A[piv][c]))piv=r;if(Math.abs(A[piv][c])<1e-12)return null;[A[c],A[piv]]=[A[piv],A[c]];const d=A[c][c];for(let j=0;j<2*n;j++)A[c][j]/=d;for(let r=0;r<n;r++)if(r!==c){const f=A[r][c];if(f)for(let j=0;j<2*n;j++)A[r][j]-=f*A[c][j];}}return A.map(r=>r.slice(n));}
const row=(t,season,m)=>{const r=[1,t];if(season)for(let k=1;k<m;k++)r.push(t%m===k?1:0);return r;};
// Ordinary least squares on y_t = a + b·t (+ seasonal dummies), t = 0..n-1.
// Prediction intervals: ŷ ± t(1-α/2, n-p) · s · √(1 + x₀ᵀ(XᵀX)⁻¹x₀). Assumes independent, normally distributed errors.
export function regressionForecast(ys,{periods=6,season=0,level=80}={}){
 const pts=ys.map((y,t)=>({t,y:Number(y)})).filter(d=>Number.isFinite(d.y)),n=pts.length,m=Math.max(0,Math.round(Number(season)||0)),useSeason=m>=2&&n>=m*2;
 const p=2+(useSeason?m-1:0);if(n<p+1)return null;
 const X=pts.map(d=>row(d.t,useSeason,m)),y=pts.map(d=>d.y);
 const XtX=Array.from({length:p},(_,i)=>Array.from({length:p},(_,j)=>X.reduce((s,r)=>s+r[i]*r[j],0))),inv=invert(XtX);if(!inv)return null;
 const Xty=Array.from({length:p},(_,i)=>X.reduce((s,r,k)=>s+r[i]*y[k],0)),beta=inv.map(r=>r.reduce((s,v,j)=>s+v*Xty[j],0));
 const fitted=X.map(r=>r.reduce((s,v,j)=>s+v*beta[j],0)),sse=y.reduce((s,v,i)=>s+(v-fitted[i])**2,0),df=n-p,sigma=Math.sqrt(sse/df),mean=y.reduce((a,b)=>a+b,0)/n,sst=y.reduce((s,v)=>s+(v-mean)**2,0);
 const lvl=[80,90,95].includes(Number(level))?Number(level):Number(level)===0?0:80,tq=lvl?tQuantile(1-(1-lvl/100)/2,df):0,last=ys.length-1;
 const values=Array.from({length:Math.max(1,Math.min(36,Math.round(periods)))},(_,k)=>{const t=last+k+1,x0=row(t,useSeason,m),yhat=x0.reduce((s,v,j)=>s+v*beta[j],0),lev=x0.reduce((s,vi,i)=>s+vi*x0.reduce((u,vj,j)=>u+inv[i][j]*vj,0),0),half=lvl?tq*sigma*Math.sqrt(1+lev):0;return {t,y:yhat,lower:yhat-half,upper:yhat+half};});
 return {values,beta,sigma,df,n,r2:sst?1-sse/sst:0,level:lvl,season:useSeason?m:0,seasonRequested:m,slope:beta[1]};
}

// ---------- k-means ----------
function rng(seed){let a=seed>>>0;return ()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
const dist2=(a,b)=>(a[0]-b[0])**2+(a[1]-b[1])**2;
function kmeansOnce(Z,k,rand){const cents=[Z[Math.floor(rand()*Z.length)]];while(cents.length<k){const d=Z.map(z=>Math.min(...cents.map(c=>dist2(z,c)))),total=d.reduce((a,b)=>a+b,0);if(!total){cents.push(Z[Math.floor(rand()*Z.length)]);continue;}let r=rand()*total,i=0;for(;i<d.length-1&&r>d[i];i++)r-=d[i];cents.push(Z[i]);}
 let labels=new Array(Z.length).fill(0),C=cents.map(c=>[...c]);for(let it=0;it<100;it++){let moved=false;for(let i=0;i<Z.length;i++){let best=0,bd=Infinity;for(let j=0;j<k;j++){const d=dist2(Z[i],C[j]);if(d<bd){bd=d;best=j;}}if(labels[i]!==best){labels[i]=best;moved=true;}}const sums=C.map(()=>[0,0,0]);Z.forEach((z,i)=>{const s=sums[labels[i]];s[0]+=z[0];s[1]+=z[1];s[2]++;});C=C.map((c,j)=>sums[j][2]?[sums[j][0]/sums[j][2],sums[j][1]/sums[j][2]]:c);if(!moved&&it)break;}
 const inertia=Z.reduce((s,z,i)=>s+dist2(z,C[labels[i]]),0);return {labels,centroids:C,inertia};}
export function silhouette(Z,labels,k){if(Z.length>1500)Z=Z.slice(0,1500);let total=0,count=0;for(let i=0;i<Z.length;i++){const sums=new Array(k).fill(0),counts=new Array(k).fill(0);for(let j=0;j<Z.length;j++){if(i===j)continue;const d=Math.sqrt(dist2(Z[i],Z[j]));sums[labels[j]]+=d;counts[labels[j]]++;}const own=labels[i];if(!counts[own])continue;const a=sums[own]/counts[own];let b=Infinity;for(let c=0;c<k;c++)if(c!==own&&counts[c])b=Math.min(b,sums[c]/counts[c]);if(!Number.isFinite(b))continue;total+=(b-a)/Math.max(a,b);count++;}return count?total/count:0;}
// Clusters (x,y) points on standardised (z-score) axes so both variables count equally.
export function kmeans(points,k='auto',{seed=42,restarts=6}={}){
 const P=points.filter(p=>Number.isFinite(p.x)&&Number.isFinite(p.y));if(P.length<4)return null;
 const mx=P.reduce((s,p)=>s+p.x,0)/P.length,my=P.reduce((s,p)=>s+p.y,0)/P.length,sx=Math.sqrt(P.reduce((s,p)=>s+(p.x-mx)**2,0)/P.length)||1,sy=Math.sqrt(P.reduce((s,p)=>s+(p.y-my)**2,0)/P.length)||1,Z=P.map(p=>[(p.x-mx)/sx,(p.y-my)/sy]);
 const run=kk=>{const rand=rng(seed+kk);let best=null;for(let r=0;r<restarts;r++){const res=kmeansOnce(Z,kk,rand);if(!best||res.inertia<best.inertia)best=res;}return best;};
 let chosen,score=null,auto=k==='auto'||k===0;
 if(auto){let bestK=2,bestScore=-Infinity,bestRes=null;for(let kk=2;kk<=Math.min(6,P.length-1);kk++){const res=run(kk),sc=silhouette(Z,res.labels,kk);if(sc>bestScore+1e-9){bestScore=sc;bestK=kk;bestRes=res;}}chosen={k:bestK,...bestRes};score=bestScore;}
 else{const kk=Math.max(2,Math.min(8,Math.round(Number(k)),P.length-1));chosen={k:kk,...run(kk)};score=silhouette(Z,chosen.labels,kk);}
 // Order clusters by size so colours are stable for the same data.
 const sizes=Array.from({length:chosen.k},(_,j)=>chosen.labels.filter(l=>l===j).length),order=sizes.map((n,j)=>[n,j]).sort((a,b)=>b[0]-a[0]||a[1]-b[1]).map(d=>d[1]),remap=new Map(order.map((old,i)=>[old,i]));
 const labels=chosen.labels.map(l=>remap.get(l)),centroids=order.map(j=>({x:chosen.centroids[j][0]*sx+mx,y:chosen.centroids[j][1]*sy+my,n:sizes[j]}));
 const map=new Map(P.map((p,i)=>[p,labels[i]]));
 return {k:chosen.k,labels,centroids,silhouette:score,auto,map,standardised:true};
}
