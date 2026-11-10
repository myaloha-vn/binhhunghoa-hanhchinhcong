import './style.css';
import { data, categories } from './data.js';
import { sanitize } from './safe.js';

const PORTAL='https://dichvucong.gov.vn/';
const WHERE='Trung tâm Hành chính công phường Bình Hưng Hòa tại địa chỉ Số 621 Tân Kỳ Tân Quý, phường Bình Hưng Hòa, Thành phố Hồ Chí Minh';

const P={
grid:'<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>',
id:'<rect x="3" y="5" width="18" height="14" rx="2.5"/><circle cx="9" cy="11" r="2"/><path d="M6 16c.7-1.7 4.3-1.7 6 0M14 10h4M14 14h4"/>',
shield:'<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
pin:'<path d="M12 21s-6-5.5-6-10a6 6 0 0112 0c0 4.5-6 10-6 10z"/><circle cx="12" cy="11" r="2.2"/>',
users:'<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.5 3-5.5 6-5.5s6 2 6 5.5"/><circle cx="17" cy="9" r="2.3"/><path d="M17 14c2.5 0 4 1.5 4 4"/>',
store:'<path d="M4 9l1.5-5h13L20 9M4 9v11h16V9M4 9c0 2 3 2 4 0 1 2 3 2 4 0 1 2 3 2 4 0 1 2 4 2 4 0M9 20v-5h6v5"/>',
book:'<path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2zM4 19V5M8 7h7"/>',
mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
star:'<path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-3-5.4 3 1.1-6L3.2 9.4l6.1-.8z"/>',
heart:'<path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z"/>',
scale:'<path d="M12 4v16M6 20h12M5 8h14M5 8l-3 7a3.5 3.5 0 006 0zM19 8l-3 7a3.5 3.5 0 006 0z"/>',
leaf:'<path d="M5 19c0-9 5-14 15-14 0 10-5 15-14 15M5 19c3-5 6-8 10-10"/>',
building:'<path d="M4 21V5l8-2v18M12 8h8v13M4 21h16M8 9v.01M8 13v.01M8 17v.01M16 12v.01M16 16v.01"/>',
coin:'<circle cx="12" cy="12" r="8.5"/><path d="M14.5 9.2c-.6-.8-1.6-1.2-2.7-1.2-1.5 0-2.6.8-2.6 2s1 1.7 2.8 2.1c1.7.4 2.8.9 2.8 2.1s-1.1 2-2.7 2c-1.2 0-2.3-.5-2.9-1.3M12 6.5V8m0 8v1.5"/>',
flask:'<path d="M9 3h6M10 3v6l-5 9a2 2 0 002 3h10a2 2 0 002-3l-5-9V3"/>',
flag:'<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
badge:'<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/><path d="M12 8.5l1.1 2.3 2.4.3-1.8 1.6.5 2.4-2.2-1.2-2.2 1.2.5-2.4-1.8-1.6 2.4-.3z"/>',
file:'<path d="M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6"/>',
arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/>',
list:'<path d="M4 6h.01M4 12h.01M4 18h.01M8 6h12M8 12h12M8 18h12"/>',
chev:'<path d="M6 9l6 6 6-6"/>',
down:'<path d="M6 9l6 6 6-6"/>'};
const catIcon={'Sở Quy hoạch - Kiến trúc':'building','Công an Thành phố':'badge','Sở Giáo dục và Đào tạo':'book','Sở Công Thương':'store','Sở Y tế':'heart','Sở Tư pháp':'scale','Sở Nông nghiệp và Môi trường':'leaf','Sở Du lịch':'pin','Sở Xây dựng':'building','Sở Tài chính':'coin','Sở Khoa học và Công nghệ':'flask','Sở Nội vụ':'users','Sở Văn hóa và Thể thao':'star','Sở An toàn thực phẩm':'shield','Sở Dân tộc và Tôn giáo':'flag'};
const short={'Sở Giáo dục và Đào tạo':'Giáo dục & Đào tạo','Sở Nông nghiệp và Môi trường':'Nông nghiệp & Môi trường','Sở Khoa học và Công nghệ':'Khoa học & Công nghệ','Sở Văn hóa và Thể thao':'Văn hóa & Thể thao','Sở Dân tộc và Tôn giáo':'Dân tộc & Tôn giáo'};
function label(c){return short[c]||c.replace(/^Sở /,'')}
function ico(k,w){return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w||1.6}" stroke-linecap="round" stroke-linejoin="round">${P[k]||P.file}</svg>`}
const GROUPS={
  tthc:{label:'Thủ tục hành chính',icon:'building'},
  phidiagioi:{label:'Thủ tục hành chính phi địa giới',icon:'globe'}
};
// thủ tục hiển thị ở mục "Thủ tục nổi bật" (xen kẽ 2 nhóm)
const FEATURED={
  tthc:['1.000.656','1.004.746','2.000.635','1.004.884'],
  phidiagioi:['3.000.182','3.000.181','1.005.142','2.001.955']
};
const $=id=>document.getElementById(id);
// Lĩnh vực lớn của mỗi lĩnh vực chuyên môn: lấy theo cơ quan quản lý xuất hiện nhiều nhất ở lĩnh vực đó (bỏ chữ "Sở ")
const bigName=o=>o.replace(/^Sở /,'');
{const tally={};data.forEach(d=>{(tally[d.cat]??={})[d.org]=(tally[d.cat][d.org]||0)+1});
 const owner={};for(const [c,m] of Object.entries(tally))owner[c]=Object.entries(m).sort((x,y)=>y[1]-x[1])[0][0];
 data.forEach(d=>{d.parent=d.big||bigName(owner[d.cat])});}
// view: 'home' = trang chủ (thủ tục nổi bật) | 'browse' = giao diện tra cứu (danh mục lĩnh vực + danh sách)
let view='home',group='all',category='all',page=1,search='',sortAZ=false,perPage=10,sbOpen=false;const expanded=new Set();
const FAV_KEY='tthc-binhhunghoa-yeuthich';
let favs=new Set();try{favs=new Set(JSON.parse(localStorage.getItem(FAV_KEY)||'[]'))}catch(e){}
const favKey=d=>d.code+'|'+d.name;
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
const count=g=>g==='all'?data.length:data.filter(d=>d.group===g).length;
const linkOf=d=>d.source||`https://dichvucong.gov.vn/dvc-ketqua-thu-tuc?keyword=${encodeURIComponent(d.code)}`;
function normalize(s){return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/g,'d')}

/* ---------- thanh chọn nhóm ---------- */
function renderChips(){
  const cur=view==='home'?'all':group;
  const chip=(g,icon,text)=>`<button class="chip g-${g} ${cur===g?'active':''}" onclick="setGroup('${g}')">${ico(icon)}<span class="clabel">${text}</span><b>${count(g)}</b></button>`;
  $('chips').innerHTML=chip('all','grid','Tất cả thủ tục')+chip('tthc',GROUPS.tthc.icon,GROUPS.tthc.label)+chip('phidiagioi',GROUPS.phidiagioi.icon,GROUPS.phidiagioi.label);
}

/* ---------- trang chủ: thủ tục nổi bật ---------- */
function featuredRows(){
  const pick=g=>FEATURED[g].map(c=>data.find(d=>d.group===g&&d.code===c)).filter(Boolean);
  let a=pick('tthc'),b=pick('phidiagioi');
  const fill=(arr,g)=>{for(const d of data){if(arr.length>=4)break;if(d.group===g&&!arr.includes(d))arr.push(d)}return arr};
  a=fill(a,'tthc');b=fill(b,'phidiagioi');
  const out=[];for(let i=0;i<Math.max(a.length,b.length);i++){if(a[i])out.push(a[i]);if(b[i])out.push(b[i])}
  for(const d of data){if(out.length>=8)break;if(!out.includes(d))out.push(d)}
  return [...new Set([...data.filter(d=>d.feat),...out])].slice(0,8);
}
function card(d){
  return `<a class="record g-${d.group}" href="${esc(linkOf(d))}" target="_blank" rel="noopener"${(d.desc||d.content)?` onclick="openDetail(${d.id});return false"`:''}><div class="ricon">${ico(catIcon[d.org]||'file',1.5)}</div><div class="rbody"><h3><span>${esc(d.name)}</span></h3><div class="tags"><span class="tag gtag">${d.group==='phidiagioi'?'Phi địa giới':'Thủ tục hành chính'}</span><span class="tag">${esc(label(d.cat))}</span></div><p>Mã thủ tục: ${esc(d.code)}</p></div><span class="details">Xem thủ tục ${ico('arrow',2)}</span></a>`;
}
function categoryTiles(){
  const groups=['tthc','phidiagioi'];let h='';
  for(const g of groups){const list=categories.filter(c=>c.group===g);if(!list.length)continue;
    h+=`<div class="cathead g-${g}"><span class="dot"></span>${GROUPS[g].label}<b>${list.length} danh mục</b></div>`;
    h+=list.map(c=>{const n=data.filter(d=>d.group===g&&d.cat===c.name).length;return `<button class="catcard g-${g}" onclick="pickCat('${g}',${esc(JSON.stringify(c.name))})"><div class="ricon">${ico(catIcon[c.org]||'file',1.5)}</div><div class="cbody"><h3>${esc(label(c.name))}</h3><p>${n} thủ tục</p></div></button>`}).join('')}
  return h;}
function renderHome(){
  const rec=$('records');rec.classList.remove('vertical','cats');
  $('pager').innerHTML='';
  const empty=data.length===0&&categories.length===0;
  $('viewAllBtn').style.display=data.length===0?'none':'';
  $('listTitle').textContent=data.length===0?(empty?'Thủ tục hành chính':'Danh mục thủ tục'):'Thủ tục nổi bật';
  if(data.length===0){
    if(categories.length){rec.classList.add('cats');rec.innerHTML=categoryTiles()}
    else rec.innerHTML='<div class="empty">Chưa có thủ tục nào được đăng.</div>';
    return;}
  rec.innerHTML=featuredRows().map(card).join('');
}

/* ---------- giao diện tra cứu: danh mục lĩnh vực + danh sách ---------- */
function matchCat(d){return category==='all'||(category.startsWith('p:')?d.parent===category.slice(2):d.cat===category.slice(2))}
function filtered(skipCat){
  const q=normalize(search);
  return data.filter(d=>(group==='all'||d.group===group)&&(skipCat||matchCat(d))&&(!q||normalize([d.name,d.cat,d.code].join(' ')).includes(q)));
}
const starSvg='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-3-5.4 3 1.1-6L3.2 9.4l6.1-.8z"/></svg>';
function row(d){
  const meta=[['Mã',d.code,1]];
  if(d.group==='tthc')meta.push(['Lĩnh vực',d.cat]);
  meta.push(['Cơ quan',d.org]);
  return `<article class="trow g-${d.group}"><div class="tmain"><h3>${esc(d.name)}</h3><div class="tmeta">${meta.map(([k,v,b])=>`<span>${k}: ${b?`<b>${esc(v)}</b>`:esc(v)}</span>`).join('')}</div></div><div class="tact">${(d.desc||d.content)?`<button class="tbtn" onclick="openDetail(${d.id})">Xem chi tiết →</button>`:`<a class="tbtn" href="${esc(linkOf(d))}" target="_blank" rel="noopener">Xem chi tiết →</a>`}</div></article>`;
}
function renderBrowse(){
  const base=filtered(true);
  // cây: lĩnh vực lớn -> lĩnh vực chuyên môn
  const tree=new Map();
  for(const d of base){if(!tree.has(d.parent))tree.set(d.parent,{n:0,subs:new Map()});const t=tree.get(d.parent);t.n++;if(d.cat!==d.org&&bigName(d.cat)!==d.parent)t.subs.set(d.cat,(t.subs.get(d.cat)||0)+1);}
  const items=[];
  for(const [P,t] of tree){
    const subs=[...t.subs.entries()].sort((x,y)=>x[0].localeCompare(y[0],'vi'));
    if(subs.length>=2)items.push({kind:'parent',label:P,key:'p:'+P,n:t.n,subs});          // lĩnh vực lớn có nhiều lĩnh vực chuyên môn
    else if(subs.length===1)items.push({kind:'flat',label:subs[0][0],key:'c:'+subs[0][0],n:subs[0][1]});  // lĩnh vực đứng riêng, ngang hàng
    else items.push({kind:'flat',label:P,key:'p:'+P,n:t.n});
  }
  const ORDER=['Đăng ký, quản lý cư trú','Tư pháp'];   // các mục xếp lên đầu danh mục, theo thứ tự này
  const rank=l=>{const i=ORDER.indexOf(l);return i<0?ORDER.length:i};
  items.sort((x,y)=>rank(x.label)-rank(y.label)||x.label.localeCompare(y.label,'vi'));
  const valid=k=>k==='all'||items.some(it=>it.key===k||(it.subs&&it.subs.some(s=>'c:'+s[0]===k)));
  if(!valid(category))category='all';
  let rows=base.filter(matchCat);
  if(sortAZ)rows=[...rows].sort((x,y)=>x.name.localeCompare(y.name,'vi'));
  const size=Math.max(1,Math.ceil(rows.length/perPage));if(page>size)page=size;
  const part=rows.slice((page-1)*perPage,page*perPage);
  const title=search?`Kết quả tìm kiếm “${esc(search)}”`:group==='tthc'?'Danh sách thủ tục hành chính':group==='phidiagioi'?'Danh sách thủ tục hành chính phi địa giới':'Danh sách tất cả thủ tục';
  const cur=category==='all'?'Tất cả thủ tục':category.slice(2);
  $('browseView').innerHTML=`<div class="browse g-${group}">
  <aside class="sidebar2 ${sbOpen?'open':''}">
    <button class="sbhead" onclick="toggleSb()" aria-expanded="${sbOpen}">${ico('list',2)}<span class="sbtitle">Danh mục lĩnh vực</span><span class="sbcur">${esc(cur)}</span>${ico('chev',2)}</button>
    <div class="sblist">
      <button class="sbitem ${category==='all'?'active':''}" onclick="setCat('all')"><span>Tất cả thủ tục</span><b>${base.length}</b><i class="chv"></i></button>
      ${items.map(it=>it.kind==='flat'?`<button class="sbitem ${category===it.key?'active':''}" onclick="setCat(${esc(JSON.stringify(it.key))})"><span>${esc(it.label)}</span><b>${it.n}</b><i class="chv"></i></button>`:`<div class="sbgroup ${expanded.has(it.key)?'open':''}"><button class="sbitem sbparent ${category===it.key?'active':''}" onclick="toggleBig(${esc(JSON.stringify(it.key))})"><span>${esc(it.label)}</span><b>${it.n}</b><i class="chv">${ico('chev',2)}</i></button><div class="sbsubs">${it.subs.map(([n,c])=>`<button class="sbitem sbsub ${category==='c:'+n?'active':''}" onclick="setCat(${esc(JSON.stringify('c:'+n))})"><span>${esc(n)}</span><b>${c}</b><i class="chv"></i></button>`).join('')}</div></div>`).join('')}
    </div>
  </aside>
  <section class="panel">
    <div class="phead"><div><h2>${title}</h2><p>Tìm thấy <b>${rows.length}</b> thủ tục</p></div></div>
    <div class="plist">${part.length?part.map(row).join(''):'<div class="empty">Không tìm thấy thủ tục phù hợp.</div>'}</div>
    <div class="pager">${size>1?pagerHtml(size):''}</div>
  </section></div>`;
}
function pagerHtml(size){let set=new Set([1,size,page-1,page,page+1]);if(page<=3)[2,3,4].forEach(n=>set.add(n));if(page>=size-2)[size-1,size-2,size-3].forEach(n=>set.add(n));
 let list=[...set].filter(n=>n>=1&&n<=size).sort((x,y)=>x-y),h='',prev=0;
 if(page>1)h+=`<button onclick="goPage(${page-1})" aria-label="Trang trước">‹</button>`;
 for(const n of list){if(n-prev>1)h+='<span class="dots">…</span>';h+=`<button class="${page===n?'current':''}" onclick="goPage(${n})">${n}</button>`;prev=n;}
 if(page<size)h+=`<button onclick="goPage(${page+1})" aria-label="Trang sau">›</button>`;
 return h;}

/* ---------- điều khiển ---------- */
function refresh(){renderChips();$('homeView').hidden=view!=='home';$('browseView').hidden=view==='home';if(view==='home')renderHome();else renderBrowse();}
const toList=()=>$('danh-sach').scrollIntoView({behavior:'smooth'});
function goHome(){view='home';group='all';category='all';search='';$('heroSearch').value='';page=1;refresh();window.scrollTo({top:0,behavior:'smooth'});}
function setGroup(g){if(g==='all'){view='home';group='all';category='all';search='';$('heroSearch').value='';page=1;sbOpen=false;refresh();toList();return;}
  view='browse';group=g;category='all';search='';$('heroSearch').value='';page=1;sbOpen=false;refresh();toList();}
function showAll(){view='browse';group='all';category='all';search='';$('heroSearch').value='';page=1;sbOpen=false;refresh();toList();}
function pickCat(g,c){view='browse';group=g;category='c:'+c;openParentOf(category);search='';$('heroSearch').value='';page=1;sbOpen=false;refresh();toList();}
function setCat(k){openParentOf(k);category=k;page=1;sbOpen=false;refresh();}
function toggleBig(k){if(expanded.has(k))expanded.delete(k);else expanded.add(k);category=k;page=1;refresh();}
function openParentOf(k){if(k.startsWith('c:')){const d=data.find(x=>x.cat===k.slice(2));if(d)expanded.add('p:'+d.parent)}}
function setSort(v){sortAZ=v==='az';page=1;refresh();}
function setPer(v){perPage=+v;page=1;refresh();}
function toggleSb(){sbOpen=!sbOpen;const a=document.querySelector('.sidebar2');if(a)a.classList.toggle('open',sbOpen)}
function goPage(n){page=n;refresh();toList();}
function applyHeroSearch(){search=$('heroSearch').value.trim();view='browse';category='all';page=1;sbOpen=false;refresh();toList();}
function toggleFav(id,btn){const d=data.find(x=>x.id===id);if(!d)return;const k=favKey(d);if(favs.has(k))favs.delete(k);else favs.add(k);try{localStorage.setItem(FAV_KEY,JSON.stringify([...favs]))}catch(e){}btn.classList.toggle('on',favs.has(k));}
function openDetail(id){let d=data.find(v=>v.id===id);if(!d)return;document.getElementById('modalTitle').textContent=d.name;document.getElementById('modalTag').innerHTML=`<span class="tag">${esc(d.cat)}</span>${d.code?` <span class="tag">Mã thủ tục: ${esc(d.code)}</span>`:''}`;document.getElementById('modalContent').innerHTML=`<div class="infogrid"><div class="info">Cơ quan giải quyết<b>${esc(d.cat)}</b></div><div class="info">Nơi tiếp nhận và trả kết quả<b>${WHERE} (không phụ thuộc địa giới hành chính)</b></div><div class="info">Mã thủ tục<b>${d.code?esc(d.code):'Theo hướng dẫn của cán bộ tiếp nhận'}</b></div><div class="info">Hình thức thực hiện<b>Trực tiếp tại phường hoặc trực tuyến qua Cổng DVC Quốc gia</b></div></div>${(d.desc||d.content)?`${(d.desc?`<p><b>${esc(d.desc)}</b></p>`:'')+(d.content?`<div class="userc">${sanitize(d.content)}</div>`:'')}<p style="margin-top:14px"><a class="tbtn" href="${esc(linkOf(d))}" target="_blank" rel="noopener">Mở trên Cổng Dịch vụ công →</a></p>`:`<h4>Trình tự thực hiện</h4><ol><li><b>Chuẩn bị hồ sơ:</b> tham khảo thành phần hồ sơ của thủ tục tại nguồn tra cứu bên dưới hoặc hỏi cán bộ phường trước khi đến.</li><li><b>Nộp hồ sơ:</b> đến ${WHERE} để nộp trực tiếp, hoặc nộp trực tuyến trên Cổng Dịch vụ công.</li><li><b>Tiếp nhận:</b> cán bộ kiểm tra hồ sơ, hướng dẫn bổ sung nếu còn thiếu và cấp phiếu hẹn trả kết quả.</li><li><b>Theo dõi hồ sơ:</b> tra cứu tình trạng hồ sơ bằng mã hồ sơ trên phiếu hẹn.</li><li><b>Nhận kết quả:</b> nhận kết quả tại ${WHERE} theo ngày hẹn.</li></ol><h4>Thành phần hồ sơ · Thời hạn · Phí, lệ phí</h4><p>Thực hiện theo quy định của từng thủ tục. Người dân mang theo giấy tờ tùy thân khi đến làm thủ tục; cán bộ tại phường sẽ hướng dẫn cụ thể thành phần hồ sơ, thời hạn giải quyết và mức phí, lệ phí (nếu có).</p><h4>Cách thực hiện</h4><p>Người dân có thể đến trực tiếp ${WHERE} làm thủ tục, nộp qua dịch vụ bưu chính hoặc nộp trực tuyến trên Cổng DVC Quốc gia, tùy quy định của từng thủ tục.</p>`}`;document.getElementById('modalWrap').classList.add('open');document.body.style.overflow='hidden';}
function closeModal(){document.getElementById('modalWrap').classList.remove('open');document.body.style.overflow='';}

$('heroSearch').addEventListener('keydown',e=>{if(e.key==='Enter')applyHeroSearch()});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});refresh();

// các hàm được gọi từ thuộc tính onclick trong HTML
Object.assign(window,{toggleBig,goHome,pickCat,applyHeroSearch,showAll,goPage,setGroup,setCat,setSort,setPer,toggleSb,toggleFav,closeModal,openDetail});

// Thông tin đơn vị do trang quản trị lưu (nếu có)
try{const o=JSON.parse(localStorage.getItem('tthc_site_v1')||'{}');
 [['lead','heroLead'],['addr','foAddr'],['phone','foPhone'],['email','foEmail']].forEach(([k,id])=>{if(o[k]&&$(id))$(id).textContent=o[k]})}catch(e){}
