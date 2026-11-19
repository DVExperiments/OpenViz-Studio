// Pure reader viewport -> geographic locator. Cylindrical projections only.
export function locatorReaderView(model,frame,k,cx,cy){
 if(model?.version!==1||!['local','mercator','equalArea'].includes(model.kind)||![model.view,model.plot,model.inset,frame].every(a=>Array.isArray(a)&&a.length===4&&a.every(Number.isFinite))||![k,cx,cy].every(Number.isFinite)||k<1||k>8||cx<0||cx>1||cy<0||cy>1)return null;
 const [west,south,east,north]=model.view,[px,py,qx,qy]=model.plot,[ix,iy,iw,ih]=model.inset,[fx,fy,fw,fh]=frame;
 if(east<=west||east-west>360+1e-8||north<=south||south<-90||north>90||qx<=px||qy<=py||iw<=0||ih<=0||fw<=0||fh<=0)return null;
 const left=Math.max(px,fx+(cx-.5/k)*fw),right=Math.min(qx,fx+(cx+.5/k)*fw),top=Math.max(py,fy+(cy-.5/k)*fh),bottom=Math.min(qy,fy+(cy+.5/k)*fh);
 if(right<=left||bottom<=top)return {extent:null,rects:[]};
 const rad=Math.PI/180,forward=lat=>model.kind==='mercator'?Math.log(Math.tan(Math.PI/4+Math.max(-85.0511287798066,Math.min(85.0511287798066,lat))*rad/2)):model.kind==='equalArea'?Math.sin(lat*rad):lat;
 const inverse=y=>model.kind==='mercator'?(2*Math.atan(Math.exp(y))-Math.PI/2)/rad:model.kind==='equalArea'?Math.asin(Math.max(-1,Math.min(1,y)))/rad:y;
 const lo=forward(south),hi=forward(north),lat=y=>Math.max(south,Math.min(north,inverse(hi-(y-py)/(qy-py)*(hi-lo))));
 const w=west+(left-px)/(qx-px)*(east-west),e=west+(right-px)/(qx-px)*(east-west),n=lat(top),s=lat(bottom),span=Math.min(360,e-w);if(![w,s,e,n].every(Number.isFinite)||span<=0||n<=s)return null;
 const pieces=[],start=((w+180)%360+360)%360-180;if(span>=360-1e-9)pieces.push([-180,180]);else if(start+span>180)pieces.push([start,180],[-180,start+span-360]);else pieces.push([start,start+span]);
 const rawY=iy+(90-n)/180*ih,rawH=(n-s)/180*ih,h=Math.min(ih,Math.max(3,rawH)),y=Math.max(iy,Math.min(iy+ih-h,rawY+(rawH-h)/2));
 return {extent:[w,s,e,n],rects:pieces.map(([a,z])=>{const rawX=ix+(a+180)/360*iw,rawW=(z-a)/360*iw,width=Math.min(iw,Math.max(3,rawW)),x=Math.max(ix,Math.min(ix+iw-width,rawX+(rawW-width)/2));return [x,y,width,h];})};
}
