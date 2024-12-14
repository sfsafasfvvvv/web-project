import{_ as L,u as V,r as s,c as U,w as B,a as c,b as n,d as m,e as o,i as r,g as d,f as C,F as S,h as k,E as x,k as y,n as G,t as u,I as M}from"./index-237fd1da.js";import{f as E}from"./index-b42aae58.js";import"./index-54741844.js";const O={class:"news-list-page"},R={class:"container"},$={class:"page-header"},j={class:"filter-bar"},q={class:"news-grid"},H=["onClick"],J={class:"news-category"},K={class:"news-content"},Q={class:"news-meta"},W={class:"category"},X={class:"date"},Y={class:"news-title"},Z={class:"news-excerpt"},ee={class:"pagination"},te={__name:"NewsListPage",setup(ae){const b=V(),l=s("all"),i=s(1),g=s(12),h=s(100),p=s(!1),f=s([{id:1,title:"Platform Redesign Launch",excerpt:"To provide a better user experience, the platform has undergone a complete redesign...",category:"Announcements",date:new Date(Date.now()-1e3*60*60*24).toISOString(),bgColor:"#fafafa"},{id:2,title:"Trust Trading Month Campaign",excerpt:"Participate to earn credit points and get a chance to win great prizes...",category:"Activities",date:new Date(Date.now()-1e3*60*60*24*2).toISOString(),bgColor:"#f3e5f5"},{id:3,title:"Campus Trading Safety Guide",excerpt:"To ensure safe transactions, we have compiled important safety tips...",category:"Safety Guides",date:new Date(Date.now()-1e3*60*60*24*3).toISOString(),bgColor:"#e1f5fe"}]),w=U(()=>l.value==="all"?f.value:f.value.filter(t=>{switch(l.value){case"announcement":return t.category==="Announcements";case"activity":return t.category==="Activities";case"guide":return t.category==="Safety Guides";default:return!0}})),z=async t=>{try{await b.push(`/news/${t.id}`)}catch(e){console.error("Failed to navigate:",e),x.error("Failed to navigate, please try again")}},N=t=>{g.value=t,i.value=1,v()},D=t=>{i.value=t,v()},v=async()=>{p.value=!0;try{await new Promise(t=>setTimeout(t,1e3)),h.value=f.value.length}catch(t){console.error("Failed to load news:",t),x.error("Failed to load news list, please try again")}finally{p.value=!1}},P=t=>{if(!t)return"";try{return E(new Date(t),"yyyy-MM-dd",{locale:M})}catch{return console.error("Invalid date:",t),""}};return B(l,()=>{i.value=1,v()}),v(),(t,e)=>{const _=c("el-radio-button"),A=c("el-radio-group"),T=c("el-empty"),F=c("el-skeleton-item"),I=c("el-pagination");return n(),m("div",O,[o("div",R,[o("div",$,[e[7]||(e[7]=o("h1",{class:"page-title"},"Platform Updates",-1)),o("div",j,[r(A,{modelValue:l.value,"onUpdate:modelValue":e[0]||(e[0]=a=>l.value=a),size:"large"},{default:d(()=>[r(_,{value:"all"},{default:d(()=>e[3]||(e[3]=[y("All")])),_:1}),r(_,{value:"announcement"},{default:d(()=>e[4]||(e[4]=[y("Announcements")])),_:1}),r(_,{value:"activity"},{default:d(()=>e[5]||(e[5]=[y("Activities")])),_:1}),r(_,{value:"guide"},{default:d(()=>e[6]||(e[6]=[y("Safety Guides")])),_:1})]),_:1},8,["modelValue"])])]),o("div",q,[!p.value&&w.value.length===0?(n(),C(T,{key:0,description:"No news available"})):p.value?(n(!0),m(S,{key:1},k(g.value,a=>(n(),C(F,{key:a,variant:"card",style:{width:"100%",height:"300px"}}))),128)):(n(!0),m(S,{key:2},k(w.value,a=>(n(),m("div",{key:a.id,class:"news-card",onClick:oe=>z(a)},[o("div",{class:"news-image",style:G({background:a.bgColor})},[o("div",J,u(a.category),1)],4),o("div",K,[o("div",Q,[o("span",W,u(a.category),1),o("span",X,u(P(a.date)),1)]),o("h3",Y,u(a.title),1),o("p",Z,u(a.excerpt),1)])],8,H))),128))]),o("div",ee,[r(I,{"current-page":i.value,"onUpdate:currentPage":e[1]||(e[1]=a=>i.value=a),"page-size":g.value,"onUpdate:pageSize":e[2]||(e[2]=a=>g.value=a),total:h.value,"page-sizes":[12,24,36,48],layout:"total, sizes, prev, pager, next, jumper",onSizeChange:N,onCurrentChange:D},null,8,["current-page","page-size","total"])])])])}}},le=L(te,[["__scopeId","data-v-043cb4ef"]]);export{le as default};
