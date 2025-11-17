import{K as B,G as H,d,s as f,j as e}from"./supabase-Ybu9b-xV.js";import{c as k,a as z,I as v,P as G}from"./auth-Ino_gIEi.js";import{a as j,c as K}from"./home-Byd3MImq.js";import"./query-cache-C18JZZse.js";/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const D=k("Repeat",[["path",{d:"m17 2 4 4-4 4",key:"nntrym"}],["path",{d:"M3 11v-1a4 4 0 0 1 4-4h14",key:"84bu3i"}],["path",{d:"m7 22-4-4 4-4",key:"1wqhfi"}],["path",{d:"M21 13v1a4 4 0 0 1-4 4H3",key:"1rx37r"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const F=k("Shuffle",[["path",{d:"M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22",key:"1wmou1"}],["path",{d:"m18 2 4 4-4 4",key:"pucp1d"}],["path",{d:"M2 6h1.9c1.5 0 2.9.9 3.6 2.2",key:"10bdb2"}],["path",{d:"M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8",key:"vgxac0"}],["path",{d:"m18 14 4 4-4 4",key:"10pe0f"}]]);function V(){var b;const{category:h}=B(),x=H(),{playAudio:N}=z(),[o,_]=d.useState([]),[c,w]=d.useState(0),[C,g]=d.useState(!0),[p,I]=d.useState(!1),[y,A]=d.useState(!1);d.useEffect(()=>{S()},[h]);const S=async()=>{if(h){g(!0);try{const a=h.split("-").map(t=>t.charAt(0).toUpperCase()+t.slice(1)).join(" "),[r,n,m]=await Promise.all([f.from("audiobooks").select(`
            id,
            title,
            description,
            cover_url,
            duration,
            audio_url,
            created_at,
            category,
            categories,
            author:profiles!audiobooks_author_id_fkey (
              id,
              name,
              avatar_url,
              username
            )
          `).eq("status","published").contains("categories",[a]).order("created_at",{ascending:!1}),f.from("books").select(`
            id,
            title,
            description,
            cover_url,
            created_at,
            category,
            author:profiles!books_author_id_fkey (
              id,
              name,
              avatar_url,
              username
            )
          `).eq("status","published").eq("category",a).order("created_at",{ascending:!1}),f.from("podcast_episodes").select(`
            id,
            title,
            description,
            cover_url,
            duration,
            audio_url,
            created_at,
            category,
            categories,
            author:profiles!podcast_episodes_author_id_fkey (
              id,
              name,
              avatar_url,
              username
            )
          `).eq("status","published").contains("categories",[a]).order("created_at",{ascending:!1})]),i=t=>{const s=Array.isArray(t)?t[0]:t;return{id:(s==null?void 0:s.id)||"",name:(s==null?void 0:s.name)||(s==null?void 0:s.username)||"Unknown Creator",avatar:(s==null?void 0:s.avatar_url)||"",username:(s==null?void 0:s.username)||"creator"}},U=(r.data||[]).map(t=>({id:t.id,type:"audiobook",title:t.title,thumbnail:t.cover_url||"",duration:t.duration||"2 hours",views:0,createdAt:t.created_at,creator:{...i(t.author),followers:0},category:t.category||"Audiobook",categories:t.categories||[],featured:!1,rating:4.5,bookmarked:!1,likes_count:0})),L=(n.data||[]).map(t=>({id:t.id,type:"ebook",title:t.title,thumbnail:t.cover_url||"",duration:"4 hours",views:0,createdAt:t.created_at,creator:{...i(t.author),followers:0},category:t.category||"Book",categories:[],featured:!1,rating:4.5,bookmarked:!1,likes_count:0})),$=(m.data||[]).map(t=>({id:t.id,type:"podcast",title:t.title,thumbnail:t.cover_url||"",duration:t.duration||"45 min",views:0,createdAt:t.created_at,creator:{...i(t.author),followers:0},category:t.category||"Podcast",categories:t.categories||[],featured:!1,rating:4.5,bookmarked:!1,likes_count:0})),E=[...U,...$,...L];_(E)}catch(a){console.error("Error loading collection:",a)}finally{g(!1)}}},u=a=>{var n,m,i;const r=o[a];r&&(w(a),r.type==="audiobook"||r.type==="podcast"?N({id:r.id,title:r.title,author:((n=r.creator)==null?void 0:n.name)||"Unknown",authorId:((m=r.creator)==null?void 0:m.id)||"",authorUsername:((i=r.creator)==null?void 0:i.username)||"creator",thumbnail:r.thumbnail,type:r.type}):x(`/reader/${r.type}-${r.id}`))},P=()=>{if(p){const a=Math.floor(Math.random()*o.length);u(a)}else{const a=(c+1)%o.length;u(a)}},R=()=>{const a=(c-1+o.length)%o.length;u(a)},M=()=>{I(!p)},q=()=>{A(!y)};if(C)return e.jsx("div",{className:"min-h-screen flex items-center justify-center",children:e.jsxs("div",{className:"text-center",children:[e.jsx("div",{className:"w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"}),e.jsx("p",{className:"text-muted-foreground",children:"Loading collection..."})]})});const l=o[c];return e.jsx("div",{className:"min-h-screen bg-gradient-to-b from-background to-muted/30",children:e.jsxs("div",{className:"container mx-auto px-4 py-8",children:[e.jsxs("button",{onClick:()=>x(-1),className:"flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6",children:[e.jsx(j,{className:"w-5 h-5"}),"Back"]}),l&&e.jsxs("div",{className:"grid md:grid-cols-2 gap-8 mb-12",children:[e.jsx("div",{className:"relative aspect-square max-w-md mx-auto w-full rounded-2xl overflow-hidden shadow-2xl",children:e.jsx(v,{src:l.thumbnail,alt:l.title,className:"w-full h-full object-cover",loadingStrategy:"eager"})}),e.jsxs("div",{className:"flex flex-col justify-center space-y-6",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-4xl md:text-5xl font-bold mb-2",children:l.title}),e.jsx("p",{className:"text-xl text-muted-foreground",children:((b=l.creator)==null?void 0:b.name)||"Unknown Creator"})]}),e.jsxs("div",{className:"flex items-center gap-4 text-sm text-muted-foreground",children:[e.jsx("span",{className:"px-3 py-1 bg-primary/10 text-primary rounded-full",children:l.type}),e.jsx("span",{children:l.duration}),e.jsxs("span",{children:[c+1," / ",o.length]})]}),e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx("button",{onClick:M,className:`p-3 rounded-full transition-colors ${p?"bg-primary text-primary-foreground":"bg-muted hover:bg-primary/20"}`,children:e.jsx(F,{className:"w-5 h-5"})}),e.jsx("button",{onClick:R,className:"p-4 rounded-full bg-muted hover:bg-primary/20 transition-colors",children:e.jsx(j,{className:"w-6 h-6"})}),e.jsx("button",{onClick:()=>u(c),className:"p-6 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:scale-110 shadow-lg",children:e.jsx(G,{className:"w-8 h-8 fill-current ml-1"})}),e.jsx("button",{onClick:P,className:"p-4 rounded-full bg-muted hover:bg-primary/20 transition-colors",children:e.jsx(K,{className:"w-6 h-6"})}),e.jsx("button",{onClick:q,className:`p-3 rounded-full transition-colors ${y?"bg-primary text-primary-foreground":"bg-muted hover:bg-primary/20"}`,children:e.jsx(D,{className:"w-5 h-5"})})]})]})]}),e.jsxs("div",{className:"space-y-4",children:[e.jsx("h2",{className:"text-2xl font-bold",children:"Collection Playlist"}),e.jsx("div",{className:"space-y-2",children:o.map((a,r)=>{var n;return e.jsxs("button",{onClick:()=>u(r),className:`w-full flex items-center gap-4 p-4 rounded-lg transition-all ${r===c?"bg-primary/10 border-2 border-primary":"bg-card hover:bg-muted border border-transparent"}`,children:[e.jsx("div",{className:"w-16 h-16 rounded-md overflow-hidden flex-shrink-0",children:e.jsx(v,{src:a.thumbnail,alt:a.title,className:"w-full h-full object-cover"})}),e.jsxs("div",{className:"flex-1 text-left",children:[e.jsx("h3",{className:"font-medium line-clamp-1",children:a.title}),e.jsxs("p",{className:"text-sm text-muted-foreground",children:[((n=a.creator)==null?void 0:n.name)||"Unknown"," • ",a.duration]})]}),e.jsx("div",{className:"flex items-center gap-2 text-sm text-muted-foreground",children:e.jsx("span",{className:"px-2 py-1 bg-muted rounded-full text-xs",children:a.type})})]},a.id)})})]})]})})}export{V as CollectionPlayerPage};
