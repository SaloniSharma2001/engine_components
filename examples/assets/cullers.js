import{B as c,k as m,M as i}from"./web-ifc-api-BC8YMRiS.js";import{S as l}from"./stats.min-GTpOrGrX.js";import{a as p,W as u,S as b,b as y,c as f,G as g}from"./index-DJTKMiao.js";import{C as w}from"./index-DHVa0dFp.js";import"./_commonjsHelpers-Cpj98o6Y.js";import"./async-event-D8tC9awa.js";const h=document.getElementById("container"),t=new p,S=t.get(u),e=S.create();e.scene=new b(t);e.renderer=new y(t,h);e.camera=new f(t);t.init();e.camera.controls.setLookAt(13,13,13,0,0,0);e.scene.setup();const x=t.get(g);x.create(e);e.scene.three.background=null;const C=t.get(w),o=C.create(e);o.threshold=200;o.renderDebugFrame=!0;const s=o.renderer.domElement;document.body.appendChild(s);s.style.position="fixed";s.style.left="0";s.style.bottom="0";s.style.visibility="collapse";const M=new c(2,2,2),B=new m({color:"#6528D7"});function d(a){return Math.random()*a}function U(){for(let a=0;a<300;a++){const n=new i(M,B);n.position.x=d(10),n.position.y=d(10),n.position.z=d(10),n.updateMatrix(),e.scene.three.add(n),o.add(n)}}U();o.needsUpdate=!0;e.camera.controls.addEventListener("controlend",()=>{o.needsUpdate=!0});const r=new l;r.showPanel(2);document.body.append(r.dom);r.dom.style.left="0px";r.dom.style.zIndex="unset";e.renderer.onBeforeUpdate.add(()=>r.begin());e.renderer.onAfterUpdate.add(()=>r.end());
