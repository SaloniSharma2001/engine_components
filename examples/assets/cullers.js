import{B as c,a6 as i,a as l}from"./web-ifc-api-DEkz78xJ.js";import{S as m}from"./stats.min-BpIepu9J.js";import{p,C as u,s as y,i as b,H as g,d as f,T as w}from"./index-CkiSD17h.js";const h=document.getElementById("container"),t=new p,x=t.get(u),e=x.create();e.scene=new y(t);e.renderer=new b(t,h);e.camera=new g(t);t.init();e.camera.controls.setLookAt(13,13,13,0,0,0);e.scene.setup();const M=t.get(f);M.create(e);e.scene.three.background=null;const B=t.get(w),o=B.create(e);o.threshold=200;o.renderDebugFrame=!0;const s=o.renderer.domElement;document.body.appendChild(s);s.style.position="fixed";s.style.left="0";s.style.bottom="0";s.style.visibility="collapse";const C=new c(2,2,2),U=new i({color:"#6528D7"});function d(a){return Math.random()*a}function E(){for(let a=0;a<300;a++){const n=new l(C,U);n.position.x=d(10),n.position.y=d(10),n.position.z=d(10),n.updateMatrix(),e.scene.three.add(n),o.add(n)}}E();o.needsUpdate=!0;e.camera.controls.addEventListener("controlend",()=>{o.needsUpdate=!0});const r=new m;r.showPanel(2);document.body.append(r.dom);r.dom.style.left="0px";r.dom.style.zIndex="unset";e.renderer.onBeforeUpdate.add(()=>r.begin());e.renderer.onAfterUpdate.add(()=>r.end());
