import{_ as ee,K as se,u as te,L as oe,r as _,c as le,a as i,b as r,d,e,t as a,i as o,g as l,f as g,j as x,E as B,k as p,F as b,h,q as ae,m as ne,a3 as re,J as ie}from"./index-237fd1da.js";import{z as de}from"./index-26af2003.js";import"./index-54741844.js";const ue={class:"user-profile"},ce={class:"container"},_e={class:"profile-header"},pe={class:"user-card"},me={class:"user-info"},ve={class:"user-avatar",style:{background:"#f5f5f5"}},fe={class:"user-meta"},ge={class:"username"},be={class:"bio"},he={class:"user-stats"},ye={class:"stat-item"},we={class:"value"},ke={class:"value"},Ce={class:"value"},Ve={class:"user-actions"},Pe={class:"profile-content"},Ue={key:0,class:"product-grid"},Fe=["onClick"],Te={class:"product-cover",style:{background:"#f5f5f5"}},De={class:"product-tags"},Re={class:"product-info"},Se={class:"title"},Ae={class:"price"},$e={class:"meta"},xe={class:"time"},Be={class:"views"},Ne={key:0,class:"product-grid"},qe=["onClick"],ze={class:"product-info"},Ee={class:"title"},Ie={class:"price"},Me={class:"meta"},Le={class:"time"},je={class:"buyer"},Ge={key:0,class:"review-list"},Je={class:"review-header"},Ke={class:"reviewer-info"},He={class:"user-avatar small",style:{background:"#f5f5f5"}},Oe={class:"review-meta"},Qe={class:"time"},We={class:"review-content"},Xe={class:"comment"},Ye={class:"upload-placeholder",style:{background:"#f5f5f5"}},Ze={class:"dialog-footer"},es={__name:"UserProfilePage",setup(ss){const N=se(),q=te(),z=oe(),u=_({id:N.params.id,username:"示例用户",bio:"这是一个示例简介",creditScore:98,followingCount:56,followerCount:128,isFollowing:!1}),U=le(()=>{var n;return((n=z.user)==null?void 0:n.id)===u.value.id}),v=_(!1),F=_("selling"),T=_([{id:1,title:"iPhone 12 128G",price:3999,createTime:new Date(Date.now()-1e3*60*30),views:128,tags:["95新","保修中"]},{id:2,title:"数据结构与算法分析",price:20,createTime:new Date(Date.now()-1e3*60*60),views:56,tags:["二手书籍"]}]),D=_([{id:3,title:"AirPods Pro",price:999,soldTime:new Date(Date.now()-1e3*60*60*24),buyer:{id:2,username:"买家A"}}]),R=_([{id:1,reviewer:{id:2,username:"买家A"},rating:5,comment:"很好的卖家，商品描述准确，发货速度快，包装也很好，推荐购买！",createTime:new Date(Date.now()-1e3*60*60*24),product:{id:3,title:"AirPods Pro"}}]),y=_(!1),m=_({reason:"",description:"",images:[]}),E={reason:[{required:!0,message:"请选择举报原因",trigger:"change"}],description:[{required:!0,message:"请输入详细说明",trigger:"blur"},{min:10,max:500,message:"详细说明长度在10-500个字符之间",trigger:"blur"}]},I=[{value:"fake",label:"虚假信息"},{value:"harassment",label:"骚扰行为"},{value:"scam",label:"诈骗行为"},{value:"inappropriate",label:"不当行为"},{value:"other",label:"其他原因"}],M=async()=>{try{await new Promise(n=>setTimeout(n,1e3)),v.value=!v.value,B.success(v.value?"关注成功":"已取消关注")}catch(n){console.error("Follow failed:",n)}},L=()=>{q.push({name:"message",query:{userId:u.value.id}})},j=async()=>{try{await reportFormRef.value.validate(),await new Promise(n=>setTimeout(n,1e3)),y.value=!1,m.value={reason:"",description:"",images:[]},B.success("举报已提交")}catch(n){console.error("Submit report failed:",n)}},k=n=>ie(new Date(n),{addSuffix:!0,locale:de});return onMounted(()=>{}),(n,t)=>{var S,A;const f=i("router-link"),w=i("el-button"),C=i("el-empty"),V=i("el-tab-pane"),G=i("el-rate"),J=i("el-tabs"),K=i("el-option"),H=i("el-select"),P=i("el-form-item"),O=i("el-input"),Q=i("el-icon"),W=i("el-upload"),X=i("el-form"),Y=i("el-dialog");return r(),d("div",ue,[e("div",ce,[e("div",_e,[e("div",pe,[e("div",me,[e("div",ve,a((A=(S=u.value.username)==null?void 0:S[0])==null?void 0:A.toUpperCase()),1),e("div",fe,[e("h1",ge,a(u.value.username),1),e("p",be,a(u.value.bio||"这个人很懒，什么都没写~"),1),e("div",he,[e("div",ye,[e("span",we,a(u.value.creditScore),1),t[5]||(t[5]=e("span",{class:"label"},"信用分",-1))]),o(f,{to:{name:"user-following",params:{id:u.value.id}},class:"stat-item"},{default:l(()=>[e("span",ke,a(u.value.followingCount),1),t[6]||(t[6]=e("span",{class:"label"},"关注",-1))]),_:1},8,["to"]),o(f,{to:{name:"user-followers",params:{id:u.value.id}},class:"stat-item"},{default:l(()=>[e("span",Ce,a(u.value.followerCount),1),t[7]||(t[7]=e("span",{class:"label"},"粉丝",-1))]),_:1},8,["to"])])])]),e("div",Ve,[U.value?x("",!0):(r(),g(w,{key:0,type:v.value?"default":"primary",onClick:M},{default:l(()=>[p(a(v.value?"取消关注":"关注"),1)]),_:1},8,["type"])),U.value?x("",!0):(r(),g(w,{key:1,type:"primary",onClick:L},{default:l(()=>t[8]||(t[8]=[p(" 发消息 ")])),_:1}))])])]),e("div",Pe,[o(J,{modelValue:F.value,"onUpdate:modelValue":t[0]||(t[0]=s=>F.value=s),class:"profile-tabs"},{default:l(()=>[o(V,{label:"在售商品",name:"selling"},{default:l(()=>[T.value.length?(r(),d("div",Ue,[(r(!0),d(b,null,h(T.value,s=>(r(),d("div",{key:s.id,class:"product-card",onClick:c=>n.$router.push(`/product/${s.id}`)},[e("div",Te,[e("div",De,[(r(!0),d(b,null,h(s.tags,c=>(r(),d("span",{key:c,class:ae(["tag",c])},a(c),3))),128))])]),e("div",Re,[e("h3",Se,a(s.title),1),e("div",Ae,"¥"+a(s.price),1),e("div",$e,[e("span",xe,a(k(s.createTime)),1),e("span",Be,a(s.views)+"次浏览",1)])])],8,Fe))),128))])):(r(),g(C,{key:1,description:"暂无在售商品"}))]),_:1}),o(V,{label:"历史出售",name:"sold"},{default:l(()=>[D.value.length?(r(),d("div",Ne,[(r(!0),d(b,null,h(D.value,s=>(r(),d("div",{key:s.id,class:"product-card",onClick:c=>n.$router.push(`/product/${s.id}`)},[t[10]||(t[10]=e("div",{class:"product-cover",style:{background:"#f5f5f5"}},[e("div",{class:"product-status"},"已售出")],-1)),e("div",ze,[e("h3",Ee,a(s.title),1),e("div",Ie,"¥"+a(s.price),1),e("div",Me,[e("span",Le,a(k(s.soldTime)),1),e("span",je,[t[9]||(t[9]=p(" 买家： ")),o(f,{to:{name:"user-profile",params:{id:s.buyer.id}},class:"link"},{default:l(()=>[p(a(s.buyer.username),1)]),_:2},1032,["to"])])])])],8,qe))),128))])):(r(),g(C,{key:1,description:"暂无历史出售"}))]),_:1}),o(V,{label:"用户评价",name:"reviews"},{default:l(()=>[R.value.length?(r(),d("div",Ge,[(r(!0),d(b,null,h(R.value,s=>{var c,$;return r(),d("div",{key:s.id,class:"review-item"},[e("div",Je,[e("div",Ke,[e("div",He,a(($=(c=s.reviewer.username)==null?void 0:c[0])==null?void 0:$.toUpperCase()),1),o(f,{to:{name:"user-profile",params:{id:s.reviewer.id}},class:"username"},{default:l(()=>[p(a(s.reviewer.username),1)]),_:2},1032,["to"])]),e("div",Oe,[o(G,{modelValue:s.rating,"onUpdate:modelValue":Z=>s.rating=Z,disabled:"",colors:["#99A9BF","#F7BA2A","#FF9900"]},null,8,["modelValue","onUpdate:modelValue"]),e("span",Qe,a(k(s.createTime)),1)])]),e("div",We,[e("p",Xe,a(s.comment),1),o(f,{to:{name:"product-detail",params:{id:s.product.id}},class:"product-link"},{default:l(()=>[t[11]||(t[11]=e("span",{class:"label"},"交易商品：",-1)),p(" "+a(s.product.title),1)]),_:2},1032,["to"])])])}),128))])):(r(),g(C,{key:1,description:"暂无用户评价"}))]),_:1})]),_:1},8,["modelValue"])])]),o(Y,{modelValue:y.value,"onUpdate:modelValue":t[4]||(t[4]=s=>y.value=s),title:"举报用户",width:"500px"},{footer:l(()=>[e("span",Ze,[o(w,{onClick:t[3]||(t[3]=s=>y.value=!1)},{default:l(()=>t[12]||(t[12]=[p("取消")])),_:1}),o(w,{type:"primary",onClick:j},{default:l(()=>t[13]||(t[13]=[p(" 提交举报 ")])),_:1})])]),default:l(()=>[o(X,{ref:"reportFormRef",model:m.value,rules:E,"label-width":"80px"},{default:l(()=>[o(P,{label:"举报原因",prop:"reason"},{default:l(()=>[o(H,{modelValue:m.value.reason,"onUpdate:modelValue":t[1]||(t[1]=s=>m.value.reason=s),placeholder:"请选择举报原因"},{default:l(()=>[(r(),d(b,null,h(I,s=>o(K,{key:s.value,label:s.label,value:s.value},null,8,["label","value"])),64))]),_:1},8,["modelValue"])]),_:1}),o(P,{label:"详细说明",prop:"description"},{default:l(()=>[o(O,{modelValue:m.value.description,"onUpdate:modelValue":t[2]||(t[2]=s=>m.value.description=s),type:"textarea",rows:4,placeholder:"请详细描述问题..."},null,8,["modelValue"])]),_:1}),o(P,{label:"图片凭证",prop:"images"},{default:l(()=>[o(W,{action:"/api/upload","list-type":"picture-card","on-preview":n.handlePictureCardPreview,"on-remove":n.handleRemove,"before-upload":n.beforeUpload},{default:l(()=>[e("div",Ye,[o(Q,null,{default:l(()=>[o(ne(re))]),_:1})])]),_:1},8,["on-preview","on-remove","before-upload"])]),_:1})]),_:1},8,["model"])]),_:1},8,["modelValue"])])}}},as=ee(es,[["__scopeId","data-v-42d3fe41"]]);export{as as default};