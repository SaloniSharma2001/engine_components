import{b as d,B as p,M as c}from"./web-ifc-api-DH5A5LIH.js";import{C as u}from"./index-CyDQMoMp.js";import{R as w}from"./index-DYPuwzBX.js";import{W as b,S as f}from"./index-CF7dJ_Hf.js";import{S,a as y}from"./simple-camera-B35NBbik.js";const M=document.getElementById("container"),t=new u,g=t.get(b),e=g.create();e.scene=new S(t);e.renderer=new f(t,M);e.camera=new y(t);t.init();e.camera.controls.setLookAt(10,10,10,0,0,0);e.scene.setup();const i=new d({color:"#6528D7"}),x=new d({color:"#BCF124"}),l=new p(3,3,3),a=new c(l,i),n=new c(l,i),r=new c(l,i);e.scene.three.add(a,n,r);const B=[a,n,r];n.position.x=5;r.position.x=-5;const o=Math.PI/180;function C(){a.rotation.x+=o,a.rotation.y+=o,n.rotation.x+=o,n.rotation.z+=o,r.rotation.y+=o,r.rotation.z+=o}e.renderer.onBeforeUpdate.add(C);const h=t.get(w),R=h.get(e);let m=null;window.onmousemove=()=>{const s=R.castRay(B);m&&(m.material=i),!(!s||!(s.object instanceof c))&&(s.object.material=x,m=s.object)};
