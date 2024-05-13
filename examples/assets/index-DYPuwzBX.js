var u=Object.defineProperty;var c=(r,e,t)=>e in r?u(r,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[e]=t;var i=(r,e,t)=>(c(r,typeof e!="symbol"?e+"":e,t),t);import{E as n,a as l}from"./index-CyDQMoMp.js";import{f as p,R as m}from"./web-ifc-api-DH5A5LIH.js";class f{constructor(e){i(this,"_event");i(this,"_position",new p);i(this,"onDisposed",new n);i(this,"updateMouseInfo",e=>{this._event=e});this.dom=e,this.setupEvents(!0)}get position(){if(this._event){const e=this.dom.getBoundingClientRect();this._position.x=this.getPositionX(e,this._event),this._position.y=this.getPositionY(e,this._event)}return this._position}dispose(){this.setupEvents(!1),this.onDisposed.trigger(),this.onDisposed.reset()}getPositionY(e,t){return-((t.clientY-e.top)/(e.bottom-e.top))*2+1}getPositionX(e,t){return(t.clientX-e.left)/(e.right-e.left)*2-1}setupEvents(e){e?this.dom.addEventListener("mousemove",this.updateMouseInfo):this.dom.removeEventListener("mousemove",this.updateMouseInfo)}}class g{constructor(e,t){i(this,"enabled",!0);i(this,"components");i(this,"onDisposed",new n);i(this,"mouse");i(this,"three",new m);i(this,"world");const s=t.renderer;if(!s)throw new Error("A renderer is needed for the raycaster to work!");this.world=t,this.mouse=new f(s.three.domElement),this.components=e}dispose(){this.mouse.dispose(),this.onDisposed.trigger(),this.onDisposed.reset()}castRay(e=Array.from(this.world.meshes)){if(!this.world)throw new Error("A world is needed to cast rays!");const t=this.world.camera.three;return this.three.setFromCamera(this.mouse.position,t),this.intersect(e)}castRayFromVector(e,t,s=Array.from(this.world.meshes)){return this.three.set(e,t),this.intersect(s)}intersect(e=Array.from(this.world.meshes)){const t=this.three.intersectObjects(e),s=this.filterClippingPlanes(t);return s.length>0?s[0]:null}filterClippingPlanes(e){if(!this.world.renderer)throw new Error("Renderer not found!");const t=this.world.renderer.three;if(!t.clippingPlanes)return e;const s=t.clippingPlanes;return e.length<=0||!s||(s==null?void 0:s.length)<=0?e:e.filter(d=>s.every(a=>a.distanceToPoint(d.point)>0))}}const o=class o extends l{constructor(t){super(t);i(this,"enabled",!0);i(this,"list",new Map);i(this,"onDisposed",new n);t.add(o.uuid,this)}get(t){if(this.list.has(t.uuid))return this.list.get(t.uuid);const s=new g(this.components,t);return this.list.set(t.uuid,s),t.onDisposed.add(()=>{this.delete(t)}),s}delete(t){const s=this.list.get(t.uuid);s&&s.dispose(),this.list.delete(t.uuid)}dispose(){for(const[t,s]of this.list)s.dispose();this.list.clear(),this.onDisposed.trigger()}};i(o,"uuid","d5d8bdf0-db25-4952-b951-b643af207ace");let h=o;export{h as R};
