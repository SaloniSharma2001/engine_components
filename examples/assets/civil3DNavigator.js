import{q as i,S as p}from"./web-ifc-api-DEkz78xJ.js";import{p as l,C as m,s as h,H as f,d as g,u,T as w}from"./index-BT4udTRq.js";import{S as y}from"./stats.min-BpIepu9J.js";import{U,g as b}from"./index-BOHgXXH6.js";const d=document.getElementById("container"),t=new l,S=t.get(m),e=S.create();e.scene=new h(t);e.renderer=new U(t,d);e.camera=new f(t);t.init();e.scene.setup();e.camera.controls.setLookAt(5,5,5,0,0,0);d.appendChild(e.renderer.three2D.domElement);const v=t.get(g);v.create(e);e.scene.three.background=null;const A=t.get(u),B=await fetch("https://thatopen.github.io/engine_components/resources/road.frag"),C=await B.arrayBuffer(),E=new Uint8Array(C),r=await A.load(E);e.scene.three.add(r);const H=await fetch("https://thatopen.github.io/engine_components/resources/road.json");r.setLocalProperties(await H.json());const a=t.get(b);a.world=e;a.draw(r);const I=t.get(w),s=I.create(e);s.threshold=10;for(const o of r.children)o instanceof i&&s.add(o);s.needsUpdate=!0;e.camera.controls.addEventListener("sleep",()=>{s.needsUpdate=!0});const c=new p(void 0,20);a.onHighlight.add(({point:o})=>{c.center.copy(o),e.camera.controls.fitToSphere(c,!0)});const n=new y;n.showPanel(2);document.body.append(n.dom);n.dom.style.left="0px";n.dom.style.zIndex="unset";e.renderer.onBeforeUpdate.add(()=>n.begin());e.renderer.onAfterUpdate.add(()=>n.end());
