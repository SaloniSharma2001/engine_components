import{a as o,B as s}from"./web-ifc-api-DEkz78xJ.js";import{p as d,C as r,s as a,i as c,H as i,d as m}from"./index-CkiSD17h.js";const l=document.getElementById("container"),n=new d,p=n.get(r),e=p.create();e.scene=new a(n);e.renderer=new c(n,l);e.camera=new i(n);n.init();const w=new o(new s);e.scene.three.add(w);e.scene.three.background=null;const g=n.get(m),u=g.create(e);console.log(u);const t=new Stats;t.showPanel(2);document.body.append(t.dom);t.dom.style.left="0px";t.dom.style.zIndex="unset";e.renderer.onBeforeUpdate.add(()=>t.begin());e.renderer.onAfterUpdate.add(()=>t.end());
