import{a7 as u,C as m}from"./web-ifc-api-BC8YMRiS.js";import{S as d}from"./stats.min-GTpOrGrX.js";import{p,a,m as c}from"./index-DyM33b1I.js";import{f as b,p as f,s as C,i as w,k as I,N as g,u as y,R as A}from"./index-CLKLHy3P.js";import"./_commonjsHelpers-Cpj98o6Y.js";const E=document.getElementById("container"),s=new b,L=s.get(f),t=L.create();t.scene=new C(s);t.renderer=new w(s,E);t.camera=new I(s);s.init();t.camera.controls.setLookAt(12,6,8,0,0,-10);t.scene.setup();const R=s.get(g);R.create(t);t.scene.three.background=null;const F=new y(s),N=await fetch("https://thatopen.github.io/engine_components/resources/small.frag"),S=await N.arrayBuffer(),h=new Uint8Array(S),i=F.load(h);t.scene.three.add(i);const o=s.get(A);o.byEntity(i);o.byIfcRel(i,u,"storeys");o.byModel(i.uuid,i);const T=o.find({entities:["IFCWALLSTANDARDCASE"]}),$=o.find({entities:["IFCSLAB"]}),k=o.find({entities:["IFCMEMBER","IFCPLATE"]}),U=o.find({entities:["IFCFURNISHINGELEMENT"]}),v=o.find({entities:["IFCDOOR"]}),B=o.find({models:[i.uuid]}),l=new d;l.showPanel(2);document.body.append(l.dom);l.dom.style.left="0px";l.dom.style.zIndex="unset";t.renderer.onBeforeUpdate.add(()=>l.begin());t.renderer.onAfterUpdate.add(()=>l.end());p.init();const e=new m,r=a.create(()=>c`
    <bim-panel active label="Classifier Tutorial" class="options-menu">
      <bim-panel-section collapsed label="Controls">
      
        <bim-color-input 
          label="Walls Color" color="#202932" 
          @input="${({target:n})=>{e.set(n.color),o.setColor(T,e)}}">
        </bim-color-input>
      
        <bim-color-input 
          label="Slabs Color" color="#202932" 
          @input="${({target:n})=>{e.set(n.color),o.setColor($,e)}}">
        </bim-color-input>
      
        <bim-color-input 
          label="Curtain walls Color" color="#202932" 
          @input="${({target:n})=>{e.set(n.color),o.setColor(k,e)}}">
        </bim-color-input>
      
        <bim-color-input 
          label="Furniture Color" color="#202932" 
          @input="${({target:n})=>{e.set(n.color),o.setColor(U,e)}}">
        </bim-color-input>
      
        <bim-color-input 
          label="Doors Color" color="#202932" 
          @input="${({target:n})=>{e.set(n.color),o.setColor(v,e)}}">
        </bim-color-input>
                  
        <bim-button 
          label="Reset walls color" 
          @click="${()=>{o.resetColor(B)}}">  
        </bim-button>  

      </bim-panel-section>
    </bim-panel>
    `);document.body.append(r);const D=a.create(()=>c`
      <bim-button class="phone-menu-toggler" icon="solar:settings-bold"
        @click="${()=>{r.classList.contains("options-menu-visible")?r.classList.remove("options-menu-visible"):r.classList.add("options-menu-visible")}}">
      </bim-button>
    `);document.body.append(D);
