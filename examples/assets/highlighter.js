import"./web-ifc-api-BC8YMRiS.js";import{S as r}from"./stats.min-GTpOrGrX.js";import{f as s,p as a,s as c,i,k as d,N as m,u as p}from"./index-CLKLHy3P.js";import"./import-wrapper-prod-LhqN7JJy.js";import{H as f}from"./index-BUGwU_Yk.js";import"./_commonjsHelpers-Cpj98o6Y.js";const l=document.getElementById("container"),t=new s,g=t.get(a),e=g.create();e.scene=new c(t);e.renderer=new i(t,l);e.camera=new d(t);t.init();e.camera.controls.setLookAt(12,6,8,0,0,-10);e.scene.setup();const w=t.get(m);w.create(e);const h=new p(t),u=await fetch("https://thatopen.github.io/engine_components/resources/small.frag"),y=await u.arrayBuffer(),b=new Uint8Array(y),k=h.load(b);e.scene.three.add(k);const n=t.get(f);n.setup({world:e});n.zoomToSelection=!0;const o=new r;o.showPanel(2);document.body.append(o.dom);o.dom.style.left="0px";e.renderer.onBeforeUpdate.add(()=>o.begin());e.renderer.onAfterUpdate.add(()=>o.end());
