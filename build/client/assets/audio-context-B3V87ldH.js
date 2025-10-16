import{d as r,j as w}from"./supabase-CK9k-UJW.js";const y=typeof window<"u",f=y&&typeof window.localStorage<"u"?window.localStorage:{get length(){return 0},key:()=>null,getItem:()=>null,setItem:()=>{},removeItem:()=>{},clear:()=>{}},v={theme:"system",setTheme:()=>null},p=r.createContext(v);function k({children:t,defaultTheme:l="system",storageKey:s="ui-theme",...c}){const[e,a]=r.useState(()=>f.getItem(s)||l);r.useEffect(()=>{if(!y)return;const o=window.document.documentElement;if(o.classList.remove("light","dark"),e==="system"){const u=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";o.classList.add(u);return}o.classList.add(e)},[e]);const i={theme:e,setTheme:o=>{f.setItem(s,o),a(o)}};return w.jsx(p.Provider,{...c,value:i,children:t})}const E=()=>{const t=r.useContext(p);if(t===void 0)throw new Error("useTheme must be used within a ThemeProvider");return t};/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var C={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const S=t=>t.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase().trim(),g=(t,l)=>{const s=r.forwardRef(({color:c="currentColor",size:e=24,strokeWidth:a=2,absoluteStrokeWidth:i,className:o="",children:u,...m},h)=>r.createElement("svg",{ref:h,...C,width:e,height:e,stroke:c,strokeWidth:i?Number(a)*24/Number(e):a,className:["lucide",`lucide-${S(t)}`,o].join(" "),...m},[...l.map(([n,d])=>r.createElement(n,d)),...Array.isArray(u)?u:[u]]));return s.displayName=`${t}`,s};/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const P=g("AlertCircle",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const T=g("Loader2",[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]]),x=r.createContext(null);function b({children:t,currentPathname:l}){const[s,c]=r.useState(!1),[e,a]=r.useState(null),[i,o]=r.useState(0),m=(l??(typeof window<"u"?window.location.pathname:"")).startsWith("/player/"),h=n=>{e&&a({...e,currentTime:n})};return r.useEffect(()=>{try{const n=localStorage.getItem("audioState");if(n){const d=JSON.parse(n);a(d.currentAudio),c(d.isPlayerVisible),o(d.currentChapter||0)}}catch(n){console.error("Error restoring audio state:",n),localStorage.removeItem("audioState")}},[]),r.useEffect(()=>{if(e||s)try{localStorage.setItem("audioState",JSON.stringify({currentAudio:e,isPlayerVisible:s,currentChapter:i}))}catch(n){console.error("Error saving audio state:",n)}},[e,s,i]),w.jsx(x.Provider,{value:{isPlayerVisible:s,setPlayerVisible:c,currentAudio:e,setCurrentAudio:a,isMainPlayerPage:m,currentChapter:i,setCurrentChapter:o,updateCurrentTime:h},children:t})}function L(){const t=r.useContext(x);if(!t)throw new Error("useAudio must be used within an AudioProvider");return t}export{P as A,T as L,k as T,b as a,L as b,g as c,E as u};
