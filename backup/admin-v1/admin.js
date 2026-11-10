import './admin.css';
import * as XLSX from 'xlsx';
import { rows as baseRows } from './rows.js';
import { STORE_KEY } from './data.js';

const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const I={
  users:'<path d="M4 6h16M4 12h16M4 18h10"/>',cat:'<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>',
  io:'<path d="M12 3v12M7 8l5-5 5 5M4 17v3h16v-3"/>',search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',up:'<path d="M12 16V4M7 9l5-5 5 5M4 17v3h16v-3"/>',down:'<path d="M12 4v12M7 11l5 5 5-5M4 17v3h16v-3"/>',
  edit:'<path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/>',trash:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  chevR:'<path d="M9 6l6 6-6 6"/>',chevL:'<path d="M15 6l-6 6 6 6"/>',x:'<path d="M6 6l12 12M18 6L6 18"/>',reset:'<path d="M4 12a8 8 0 108-8M4 4v5h5"/>',file:'<path d="M7 3h7l5 5v13H7zM14 3v5h5"/>',home:'<path d="M4 11l8-7 8 7M6 10v10h12V10"/>',globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/>',bld:'<path d="M4 21V5l8-2v18M12 8h8v13M4 21h16M8 9v.01M8 13v.01M8 17v.01M16 12v.01M16 16v.01"/>',pub:'<path d="M12 3v12M7 10l5 5 5-5M5 20h14"/>'
};
const ico=k=>`<svg viewBox="0 0 24 24">${I[k]}</svg>`;
const GL={tthc:'Thủ tục hành chính',phidiagioi:'Phi địa giới'};
const PER=15;

/* ---------- dữ liệu ---------- */
let uid=0;
const toObj=r=>({_id:++uid,name:r[0]||'',cat:r[1]||'',code:r[2]||'',link:r[3]||'',group:r[4]==='phidiagioi'?'phidiagioi':'tthc',org:r[5]||''});
const toRow=o=>[o.name,o.cat,o.code,o.link,o.group,o.org];
function load(){try{const s=JSON.parse(localStorage.getItem(STORE_KEY)||'null');if(Array.isArray(s)&&s.length)return s}catch(e){}return baseRows}
let list=load().map(toObj);
let st={view:'dash',cat:'all',q:'',page:1};
const VG={tthc:'tthc',phi:'phidiagioi'};
const isCustom=()=>localStorage.getItem(STORE_KEY)!==null;
function save(){localStorage.setItem(STORE_KEY,JSON.stringify(list.map(toRow)));}
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().trim();
const cats=()=>[...new Set(list.map(d=>d.cat))].filter(Boolean).sort((a,b)=>a.localeCompare(b,'vi'));
const orgs=()=>[...new Set(list.map(d=>d.org))].filter(Boolean).sort((a,b)=>a.localeCompare(b,'vi'));
const fixCode=c=>{c=String(c||'').trim();return /^\d{7}$/.test(c)?c.replace(/^(\d)(\d{3})(\d{3})$/,'$1.$2.$3'):c};

/* ---------- tiện ích giao diện ---------- */
function toast(m,err){const t=document.createElement('div');t.className='toast'+(err?' err':'');t.textContent=m;$('toasts').appendChild(t);setTimeout(()=>t.remove(),3200)}
function modal(title,body,foot){$('mbox').innerHTML=`<div class="mh"><h3>${title}</h3><button class="ib" onclick="A.closeModal()" aria-label="Đóng">${ico('x')}</button></div><div class="mb">${body}</div><div class="mf">${foot}</div>`;$('mwrap').classList.add('on')}
function closeModal(){$('mwrap').classList.remove('on')}
function menu(on){$('side').classList.toggle('on',on);$('sback').classList.toggle('on',on)}

/* ---------- vẽ giao diện ---------- */
const NAV=[['dash','home','Tổng quan'],['tthc','bld','Thủ tục hành chính'],['phi','globe','Thủ tục phi địa giới'],['fields','cat','Lĩnh vực'],['import','up','Nhập từ Excel'],['export','pub','Xuất & đăng lên web'],['site','file','Thông tin đơn vị']];
const TITLE={dash:'Tổng quan',tthc:'Thủ tục hành chính',phi:'Thủ tục hành chính phi địa giới',fields:'Danh mục lĩnh vực',import:'Nhập từ Excel',export:'Xuất & đăng lên web',site:'Thông tin đơn vị'};
function render(){
  $('snav').innerHTML=NAV.map(([k,i,t])=>`<a class="${st.view===k?'on':''}" onclick="A.go('${k}')">${ico(i)}${t}</a>`).join('');
  $('pageTitle').textContent=TITLE[st.view];
  $('crumb').innerHTML=`Trang chủ ${ico('chevR').replace('<svg','<svg width="14"')}<b>${NAV.find(n=>n[0]===st.view)[2]}</b>`;
  const ban=$('banner');
  if(isCustom()&&st.view!=='export'){ban.hidden=false;ban.innerHTML=`<span>Bạn đang dùng <b>bản chỉnh sửa lưu trong trình duyệt này</b>. Muốn đăng cho mọi người xem, vào mục <b>Xuất & đăng lên web</b>.</span><button class="btn sm" onclick="A.go('export')">Mở mục đăng</button>`}else ban.hidden=true;
  const V={dash:viewDash,tthc:()=>viewList('tthc'),phi:()=>viewList('phidiagioi'),fields:viewFields,import:viewImport,export:viewExport,site:viewSite};
  $('content').innerHTML=V[st.view]();
}
const GRP=()=>VG[st.view];
function filtered(){
  const q=norm(st.q);
  return list.filter(d=>d.group===GRP()&&(st.cat==='all'||d.cat===st.cat)&&(!q||norm(d.name+' '+d.code+' '+d.cat+' '+d.org).includes(q)));
}
function viewList(g){
  const f=filtered(),pages=Math.max(1,Math.ceil(f.length/PER));if(st.page>pages)st.page=pages;
  const sl=f.slice((st.page-1)*PER,st.page*PER);
  const gl=list.filter(d=>d.group===g);
  const catOpts=`<option value="all">Tất cả lĩnh vực</option>`+[...new Set(gl.map(d=>d.cat))].sort((a,b)=>a.localeCompare(b,'vi')).map(c=>`<option ${st.cat===c?'selected':''} value="${esc(c)}">${esc(c)}</option>`).join('');
  const from=f.length?(st.page-1)*PER+1:0;
  const nums=[];for(let p=1;p<=pages;p++)if(p===1||p===pages||Math.abs(p-st.page)<=1)nums.push(p);
  let prev=0;const btns=nums.map(p=>{const gap=prev&&p-prev>1?'<span>…</span>':'';prev=p;return gap+`<button class="${p===st.page?'on':''}" onclick="A.page(${p})">${p}</button>`}).join('');
  return `<div class="card toolbar">
    <div class="search">${ico('search')}<input class="inp" id="q" placeholder="Tìm tên, mã, lĩnh vực…" value="${esc(st.q)}" oninput="A.search(this.value)"></div>
    <select class="sel" onchange="A.setCat(this.value)">${catOpts}</select><span class="cnt">${gl.length} thủ tục</span><div class="sp"></div>
    <button class="btn pri" onclick="A.edit()">${ico('plus')}Thêm thủ tục</button>
  </div>
  <div class="card"><div class="tw"><table><thead><tr><th>Tên thủ tục</th><th>Mã TTHC</th><th>Lĩnh vực</th><th>Cơ quan</th><th style="text-align:right">Thao tác</th></tr></thead><tbody>
  ${sl.map(d=>`<tr><td class="nm">${esc(d.name)}</td><td class="mono">${esc(d.code)}</td><td>${esc(d.cat)}</td><td>${esc(d.org)}</td><td><div class="act"><button class="ib" title="Sửa" onclick="A.edit(${d._id})">${ico('edit')}</button><button class="ib del" title="Xóa" onclick="A.del(${d._id})">${ico('trash')}</button></div></td></tr>`).join('')||`<tr><td colspan="5" class="empty">Không có thủ tục nào phù hợp.</td></tr>`}
  </tbody></table></div>
  <div class="pg"><span>${f.length?`Hiển thị <b>${from}–${Math.min(st.page*PER,f.length)}</b> trong <b>${f.length}</b> thủ tục`:'0 thủ tục'}</span><div class="pgb"><button ${st.page<=1?'disabled':''} onclick="A.page(${st.page-1})">${ico('chevL')}</button>${btns}<button ${st.page>=pages?'disabled':''} onclick="A.page(${st.page+1})">${ico('chevR')}</button></div></div></div>`;
}
function viewDash(){
  const n=g=>list.filter(d=>d.group===g).length;
  const m=new Map();list.forEach(d=>m.set(d.cat,(m.get(d.cat)||0)+1));
  const top=[...m].sort((a,b)=>b[1]-a[1]).slice(0,8),mx=top[0]?top[0][1]:1;
  return `<div class="stats"><div class="card stat"><small>Tổng số thủ tục</small><b>${list.length}</b></div><div class="card stat"><small>Thủ tục hành chính</small><b style="color:var(--g)">${n('tthc')}</b></div><div class="card stat"><small>Phi địa giới</small><b style="color:var(--o)">${n('phidiagioi')}</b></div><div class="card stat"><small>Lĩnh vực</small><b>${m.size}</b></div></div>
  <div class="pgrid2"><div class="card panel full"><h2>Thao tác nhanh</h2><p>Chọn việc bạn cần làm:</p><div class="qa">
    <button class="qbtn" onclick="A.go('tthc');A.edit()"><span>${ico('plus')}</span><b>Thêm thủ tục</b><small>Nhập tay từng thủ tục</small></button>
    <button class="qbtn" onclick="A.go('import')"><span>${ico('up')}</span><b>Nhập từ Excel</b><small>Thêm hàng loạt từ file</small></button>
    <button class="qbtn" onclick="A.go('export')"><span>${ico('pub')}</span><b>Xuất & đăng lên web</b><small>Tải dữ liệu, cập nhật trang</small></button>
    <button class="qbtn" onclick="A.go('site')"><span>${ico('file')}</span><b>Thông tin đơn vị</b><small>Địa chỉ, điện thoại, email</small></button></div></div>
  <div class="card panel full"><h2>Lĩnh vực nhiều thủ tục nhất</h2><p>&nbsp;</p>${top.map(([c,k])=>`<div class="bar"><span>${esc(c)}</span><i><u style="width:${k/mx*100}%"></u></i><b>${k}</b></div>`).join('')}</div></div>`;
}
function viewFields(){
  const m=new Map();list.forEach(d=>{const k=d.group+'|'+d.cat;(m.get(k)||m.set(k,{group:d.group,cat:d.cat,orgs:new Set(),n:0}).get(k)).n++;m.get(k).orgs.add(d.org)});
  const a=[...m.values()].sort((x,y)=>x.group.localeCompare(y.group)||x.cat.localeCompare(y.cat,'vi'));
  return `<div class="card"><div class="tw"><table><thead><tr><th>Lĩnh vực</th><th>Nhóm</th><th>Cơ quan</th><th>Số thủ tục</th><th style="text-align:right">Thao tác</th></tr></thead><tbody>
  ${a.map(x=>`<tr><td><b style="font-weight:500">${esc(x.cat)}</b></td><td><span class="tag ${x.group==='tthc'?'g':'o'}">${GL[x.group]}</span></td><td>${esc([...x.orgs].join(', '))}</td><td>${x.n}</td><td><div class="act"><button class="ib" title="Đổi tên" onclick="A.rename('${x.group}','${esc(x.cat).replace(/'/g,'&#39;')}')">${ico('edit')}</button></div></td></tr>`).join('')}
  </tbody></table></div><div class="pg"><span>Đổi tên một lĩnh vực sẽ áp dụng cho toàn bộ thủ tục thuộc lĩnh vực đó (trong cùng nhóm).</span></div></div>`;
}
function viewImport(){
  return `<div class="card panel full"><div class="steps">
   <div class="step"><span class="num">1</span><div><h2>Chuẩn bị file Excel</h2><p>File cần có dòng tiêu đề gồm các cột dưới đây (thứ tự tùy ý, cột nào thiếu vẫn nhập được trừ Tên thủ tục và Mã TTHC).</p>
   <div class="prev"><table><thead><tr><th>Tên thủ tục</th><th>Lĩnh vực</th><th>Mã TTHC</th><th>Link</th><th>Nhóm</th><th>Cơ quan</th></tr></thead><tbody><tr><td>Thủ tục đăng ký lại kết hôn</td><td>Hộ tịch</td><td>1.004.746</td><td>https://…</td><td>Thủ tục hành chính</td><td>Sở Tư pháp</td></tr></tbody></table></div>
   <div class="hint" style="margin:8px 0 12px">Cột Nhóm ghi “Thủ tục hành chính” hoặc “Phi địa giới”. Không có cột Nhóm thì tên sheet chứa chữ “phi” sẽ được tính là phi địa giới.</div>
   <button class="btn" onclick="A.template()">${ico('down')}Tải file mẫu</button></div></div>
   <div class="step"><span class="num">2</span><div><h2>Chọn file để nhập</h2><p>Hỗ trợ .xlsx, .xls, .csv. Bạn sẽ được xem trước và chọn “thêm vào” hoặc “thay thế” trước khi nhập thật.</p>
   <div class="drop" onclick="A.pickFile()" ondragover="event.preventDefault()" ondrop="A.drop(event)">${ico('up')}<b>Bấm để chọn file</b><small>hoặc kéo thả file vào đây</small></div></div></div></div></div>`;
}
function viewExport(){
  return `<div class="pgrid">
  <div class="card panel"><h2>Bước 1 · Tải dữ liệu để đăng lên web</h2><p>Dữ liệu sửa ở đây mới lưu trong trình duyệt này. Muốn mọi người cùng thấy: tải file <b>rows.js</b> bên dưới, chép đè vào <code>src/rows.js</code>, chạy <code>npm run build</code> rồi đưa file HTML mới lên máy chủ.</p><div class="row"><button class="btn pri" onclick="A.exportJs()">${ico('down')}Tải rows.js (${list.length} thủ tục)</button></div></div>
  <div class="card panel"><h2>Sao lưu ra Excel</h2><p>Tải toàn bộ danh mục thành file Excel để lưu trữ hoặc sửa hàng loạt rồi nhập lại.</p><div class="row"><button class="btn" onclick="A.exportXlsx()">${ico('down')}Tải file Excel</button></div></div>
  <div class="card panel danger"><h2>Khôi phục dữ liệu gốc</h2><p>Xóa mọi chỉnh sửa trong trình duyệt này và quay về danh mục gốc (${baseRows.length} thủ tục).</p><div class="row"><button class="btn red" onclick="A.reset()">${ico('reset')}Khôi phục bản gốc</button></div></div></div>`;
}
const SITE_KEY='tthc_site_v1';
const siteGet=()=>{try{return JSON.parse(localStorage.getItem(SITE_KEY)||'{}')}catch(e){return{}}};
function viewSite(){
  const v=siteGet(),f=(k,l,ph,d)=>`<div class="fld"><label>${l}</label><input class="inp" id="s_${k}" value="${esc(v[k]??d??'')}" placeholder="${ph}"></div>`;
  return `<div class="card panel"><h2>Thông tin hiển thị trên trang tra cứu</h2><p>Các thông tin này hiện ở chân trang và phần đầu trang tra cứu.</p><div style="display:grid;gap:14px">
  ${f('lead','Câu giới thiệu dưới tiêu đề','Tìm đúng thủ tục, nắm rõ hồ sơ và cách thực hiện.')}
  ${f('addr','Địa chỉ','Số 621 Tân Kỳ Tân Quý, phường Bình Hưng Hòa…')}
  <div class="two">${f('phone','Điện thoại','VD: 028 3875 1234')}${f('email','Email','VD: hanhchinhcong@binhhunghoa.gov.vn')}</div>
  <div class="row"><button class="btn pri" onclick="A.saveSite()">Lưu thông tin</button><button class="btn" onclick="A.clearSite()">Về mặc định</button></div></div>
  <div class="hint" style="margin-top:12px">Lưu trong trình duyệt này, hiển thị khi mở trang tra cứu cùng nơi. Để đăng chính thức cho mọi người, cần sửa trong <code>index.html</code>.</div></div>`;
}
/* ---------- thêm / sửa / xóa ---------- */
function edit(id){
  const d=id?list.find(x=>x._id===id):{name:'',cat:'',code:'',link:'',group:VG[st.view]||'tthc',org:''};
  modal(id?'Sửa thủ tục':'Thêm thủ tục',`
  <div class="fld"><label>Tên thủ tục <i>*</i></label><textarea class="txt" id="f_name">${esc(d.name)}</textarea></div>
  <div class="two"><div class="fld"><label>Nhóm <i>*</i></label><select class="sel" style="width:100%;max-width:none" id="f_group"><option value="tthc" ${d.group==='tthc'?'selected':''}>Thủ tục hành chính</option><option value="phidiagioi" ${d.group==='phidiagioi'?'selected':''}>Phi địa giới</option></select></div>
  <div class="fld"><label>Mã TTHC <i>*</i></label><input class="inp" id="f_code" value="${esc(d.code)}" placeholder="VD: 1.004.746"></div></div>
  <div class="two"><div class="fld"><label>Lĩnh vực <i>*</i></label><input class="inp" id="f_cat" list="dl_cat" value="${esc(d.cat)}"><datalist id="dl_cat">${cats().map(c=>`<option value="${esc(c)}">`).join('')}</datalist></div>
  <div class="fld"><label>Cơ quan</label><input class="inp" id="f_org" list="dl_org" value="${esc(d.org)}"><datalist id="dl_org">${orgs().map(c=>`<option value="${esc(c)}">`).join('')}</datalist></div></div>
  <div class="fld"><label>Đường link thủ tục</label><input class="inp" id="f_link" value="${esc(d.link)}" placeholder="https://dichvucong.gov.vn/…"><div class="hint">Để trống thì trang tra cứu tự dùng link tìm theo mã TTHC trên Cổng DVC Quốc gia.</div></div>`,
  `<button class="btn" onclick="A.closeModal()">Hủy</button><button class="btn pri" onclick="A.saveItem(${id||0})">Lưu</button>`);
}
function saveItem(id){
  const v=k=>$('f_'+k).value.trim();
  const o={name:v('name'),cat:v('cat'),code:fixCode(v('code')),link:v('link'),group:v('group'),org:v('org')};
  if(!o.name||!o.cat||!o.code){toast('Vui lòng nhập Tên, Mã TTHC và Lĩnh vực',1);return}
  if(o.link&&!/^https?:\/\//i.test(o.link)){toast('Đường link phải bắt đầu bằng http:// hoặc https://',1);return}
  if(id){Object.assign(list.find(x=>x._id===id),o)}else list.unshift({_id:++uid,...o});
  save();closeModal();render();toast(id?'Đã cập nhật thủ tục':'Đã thêm thủ tục');
}
function del(id){const d=list.find(x=>x._id===id);
  modal('Xóa thủ tục',`<p>Bạn có chắc muốn xóa thủ tục này?</p><p><b>${esc(d.name)}</b><br><span class="hint">Mã: ${esc(d.code)}</span></p>`,`<button class="btn" onclick="A.closeModal()">Hủy</button><button class="btn red" onclick="A.doDel(${id})">Xóa</button>`)}
function doDel(id){list=list.filter(x=>x._id!==id);save();closeModal();render();toast('Đã xóa thủ tục')}
function rename(g,c){
  modal('Đổi tên lĩnh vực',`<div class="fld"><label>Tên mới</label><input class="inp" id="f_rn" value="${c}"></div>`,`<button class="btn" onclick="A.closeModal()">Hủy</button><button class="btn pri" onclick="A.doRename('${g}','${c.replace(/'/g,"\\'")}')">Lưu</button>`)}
function doRename(g,c){const n=$('f_rn').value.trim();if(!n){toast('Tên không được để trống',1);return}
  const un=s=>{const t=document.createElement('textarea');t.innerHTML=s;return t.value};c=un(c);
  list.forEach(d=>{if(d.group===g&&d.cat===c)d.cat=n});save();closeModal();render();toast('Đã đổi tên lĩnh vực')}

/* ---------- Excel ---------- */
const COLS={name:/^(ten\s*)?(thu tuc|ttnc)|ten thu tuc|ten tthc/,cat:/linh vuc/,code:/^ma\b|ma (tthc|thu tuc)|ma so/,link:/link|duong dan|url/,group:/nhom|loai/,org:/co quan|don vi/};
function parseSheet(ws,sheetName){
  const a=XLSX.utils.sheet_to_json(ws,{header:1,defval:'',raw:false});
  let h=-1,map={};
  for(let i=0;i<Math.min(a.length,15);i++){
    const m={};a[i].forEach((c,j)=>{const t=norm(c);if(!t)return;for(const k in COLS)if(!(k in m)&&COLS[k].test(t)){m[k]=j;break}});
    if('name' in m&&Object.keys(m).length>=2){h=i;map=m;break}
  }
  if(h<0)return[];
  const out=[];
  for(let i=h+1;i<a.length;i++){
    const r=a[i],g=k=>k in map?String(r[map[k]]??'').trim():'';
    const name=g('name');if(!name)continue;
    let link=g('link');
    if(!link){const c=ws[XLSX.utils.encode_cell({r:i,c:map.name})];if(c&&c.l&&c.l.Target)link=c.l.Target}
    const gt=norm(g('group')+' '+(g('group')?'':sheetName));
    out.push({name,cat:g('cat')||'Chưa phân loại',code:fixCode(g('code')),link,group:/phi/.test(gt)?'phidiagioi':'tthc',org:g('org')});
  }
  return out;
}
function pickFile(){$('fileIn').value='';$('fileIn').click()}
$('fileIn').addEventListener('change',e=>{if(e.target.files[0])handleFile(e.target.files[0])});
async function handleFile(f){
  try{
    const wb=XLSX.read(await f.arrayBuffer(),{type:'array'});
    const items=wb.SheetNames.flatMap(n=>parseSheet(wb.Sheets[n],n));
    if(!items.length){toast('Không nhận ra cột "Tên thủ tục" trong file. Hãy dùng file mẫu.',1);return}
    pending=items;
    const bad=items.filter(d=>!d.code).length;
    modal('Xem trước dữ liệu nhập',`<p>Đọc được <b>${items.length}</b> thủ tục từ <b>${esc(f.name)}</b>${bad?` (<span style="color:var(--red)">${bad} dòng thiếu mã TTHC sẽ bị bỏ qua</span>)`:''}. Dòng không có lĩnh vực được xếp vào “Chưa phân loại”.</p>
    <div class="prev"><table><thead><tr><th>Tên thủ tục</th><th>Mã</th><th>Lĩnh vực</th><th>Nhóm</th></tr></thead><tbody>${items.slice(0,8).map(d=>`<tr><td>${esc(d.name)}</td><td>${esc(d.code)}</td><td>${esc(d.cat)}</td><td>${GL[d.group]}</td></tr>`).join('')}</tbody></table></div>
    <label class="radio"><input type="radio" name="mode" value="add" checked><div><b>Thêm vào danh mục hiện có</b><span>Bỏ qua thủ tục đã có (trùng mã + tên).</span></div></label>
    <label class="radio"><input type="radio" name="mode" value="replace"><div><b>Thay thế toàn bộ danh mục</b><span>Xóa ${list.length} thủ tục hiện tại, chỉ giữ dữ liệu trong file.</span></div></label>`,
    `<button class="btn" onclick="A.closeModal()">Hủy</button><button class="btn pri" onclick="A.doImport()">Nhập dữ liệu</button>`);
  }catch(err){toast('Không đọc được file: '+err.message,1)}
}
let pending=[];
function doImport(){
  const mode=document.querySelector('input[name=mode]:checked').value;
  const items=pending.filter(d=>d.code);const skipped=pending.length-items.length;
  if(mode==='replace'){list=items.map(d=>({_id:++uid,...d}));save();closeModal();render();toast(`Đã thay thế bằng ${items.length} thủ tục`+(skipped?` (bỏ ${skipped} dòng thiếu dữ liệu)`:''));return}
  const key=d=>d.code+'|'+norm(d.name);const have=new Set(list.map(key));let n=0;
  items.forEach(d=>{if(!have.has(key(d))){have.add(key(d));list.push({_id:++uid,...d});n++}});
  save();closeModal();render();toast(`Đã thêm ${n} thủ tục mới`+(items.length-n?`, bỏ qua ${items.length-n} dòng trùng`:'')+(skipped?`, ${skipped} dòng thiếu dữ liệu`:''));
}
const HEAD=['Tên thủ tục','Lĩnh vực','Mã TTHC','Link','Nhóm','Cơ quan'];
function dl(aoa,name,sheet){const ws=XLSX.utils.aoa_to_sheet(aoa);ws['!cols']=[{wch:70},{wch:28},{wch:12},{wch:60},{wch:20},{wch:30}];const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,sheet);XLSX.writeFile(wb,name)}
const template=()=>dl([HEAD,['Thủ tục đăng ký lại kết hôn','Hộ tịch','1.004.746','https://dichvucong.gov.vn/…','Thủ tục hành chính','Sở Tư pháp'],['(Cột Nhóm: ghi "Thủ tục hành chính" hoặc "Phi địa giới")','','','','','']],'mau-nhap-thu-tuc.xlsx','Thủ tục');
const exportXlsx=()=>dl([HEAD,...list.map(d=>[d.name,d.cat,d.code,d.link,GL[d.group]==='Phi địa giới'?'Phi địa giới':'Thủ tục hành chính',d.org])],'danh-muc-thu-tuc.xlsx','Thủ tục');
function exportJs(){
  const txt=`// Danh mục thủ tục hành chính phường Bình Hưng Hòa — xuất từ trang quản trị ngày ${new Date().toLocaleDateString('vi-VN')}
// Mỗi dòng: [tên thủ tục, lĩnh vực, mã TTHC, đường link, nhóm ('tthc' | 'phidiagioi'), cơ quan]
export const rows=[\n${list.map(d=>JSON.stringify(toRow(d))).join(',\n')}];\n`;
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type:'text/javascript'}));a.download='rows.js';a.click();URL.revokeObjectURL(a.href);toast('Đã tải rows.js');
}
function reset(){modal('Khôi phục bản gốc',`<p>Mọi chỉnh sửa trong trình duyệt này sẽ mất. Bạn chắc chắn chứ?</p>`,`<button class="btn" onclick="A.closeModal()">Hủy</button><button class="btn red" onclick="A.doReset()">Khôi phục</button>`)}
function doReset(){localStorage.removeItem(STORE_KEY);list=baseRows.map(toObj);closeModal();render();toast('Đã khôi phục dữ liệu gốc')}

/* ---------- điều khiển ---------- */
window.A={closeModal,menu,pickFile,template,exportXlsx,exportJs,edit,saveItem,del,doDel,rename,doRename,doImport,reset,doReset,
  go(v){st.view=v;st.cat='all';st.q='';st.page=1;menu(false);render()},
  drop(e){e.preventDefault();const f=e.dataTransfer.files[0];if(f)handleFile(f)},
  saveSite(){const o={};['lead','addr','phone','email'].forEach(k=>o[k]=$('s_'+k).value.trim());localStorage.setItem(SITE_KEY,JSON.stringify(o));toast('Đã lưu thông tin đơn vị')},
  clearSite(){localStorage.removeItem(SITE_KEY);render();toast('Đã về mặc định')},
  setCat(c){st.cat=c;st.page=1;render()},page(p){st.page=p;render();window.scrollTo(0,0)},
  search(v){st.q=v;st.page=1;render();const el=$('q');el.focus();el.setSelectionRange(v.length,v.length)}};
render();
