import './admin.css';
import * as XLSX from 'xlsx';
import { allData, STORE_KEY } from './data.js';
import { sanitize } from './safe.js';
let uid=0;
let all=allData.map(d=>({...d,_id:++uid}));
let form=null,kw=[],srcMode=false;
// Lĩnh vực lớn (giống trang tra cứu): theo cơ quan xuất hiện nhiều nhất ở mỗi lĩnh vực, bỏ chữ "Sở "
function calcParent(){const t={};all.forEach(d=>{(t[d.cat]??={})[d.org]=(t[d.cat][d.org]||0)+1});
  const own={};for(const[c,m]of Object.entries(t))own[c]=Object.entries(m).sort((x,y)=>y[1]-x[1])[0][0];
  all.forEach(d=>{d.parent=d.big||(own[d.cat]||d.cat).replace(/^Sở /,'')})}
calcParent();
// Khung trang quản trị (sidebar, thanh tiêu đề, breadcrumb). Phần nội dung #content để trống.
// Bản đầy đủ cũ: backup/admin-v1/admin.js
const $=id=>document.getElementById(id);
const ico=d=>`<svg viewBox="0 0 24 24">${d}</svg>`;
const CHEV='<path d="M6 9l6 6 6-6"/>';
// Mục có "sub" là mục cha (bấm để mở/đóng), các mục con nằm trong sub
const NAV=[
 {k:'list',t:'Danh sách thủ tục',i:'<path d="M4 6h.01M4 12h.01M4 18h.01M8 6h12M8 12h12M8 18h12"/>',sub:[
  {k:'tthc',t:'Thủ tục hành chính'},
  {k:'phi',t:'Thủ tục phi địa giới'}]},
 {k:'fields',t:'Danh mục lĩnh vực',i:'<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>'}];
let view='tthc',open=true;
function render(){
  const parent=NAV.find(n=>n.k===view||(n.sub&&n.sub.some(c=>c.k===view)));
  const child=parent.sub&&parent.sub.find(c=>c.k===view);
  $('snav').innerHTML=NAV.map(n=>n.sub?
    `<a class="${parent===n?'on':''}" onclick="A.toggle()">${ico(n.i)}<span style="flex:1">${n.t}</span><svg viewBox="0 0 24 24" style="width:16px;height:16px;transition:.2s;transform:rotate(${open?180:0}deg)">${CHEV}</svg></a>
     <div class="sub" ${open?'':'hidden'}>${n.sub.map(c=>`<a class="${c.k===view?'on':''}" onclick="A.go('${c.k}')">${c.t}</a>`).join('')}</div>`:
    `<a class="${n.k===view?'on':''}" onclick="A.go('${n.k}')">${ico(n.i)}${n.t}</a>`).join('');
  const title=form?(form.id?'Cập nhật thủ tục':'Thêm thủ tục'):(child?child.t:parent.t);
  $('pageTitle').textContent=title;
  const ch=ico('<path d="M9 6l6 6-6 6"/>').replace('<svg','<svg width="14"');
  $('crumb').innerHTML=`Trang chủ ${ch}`+(form?`${parent.t} ${ch}${child?child.t+' '+ch:''}<b>${form.id?'Cập nhật':'Thêm mới'}</b>`:child?`${parent.t} ${ch}<b>${child.t}</b>`:`<b>${parent.t}</b>`);
  $('content').innerHTML=form?formView():(view==='tthc'?listView('tthc'):view==='phi'?listView('phidiagioi'):view==='fields'?fieldsView():'');
  if(form)initForm();
}

/* ---------- Danh sách thủ tục (đúng dữ liệu đang hiện ngoài trang web) ---------- */
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase();
const VGRP=()=>view==='phi'?'phidiagioi':'tthc';
const loadCols=()=>{try{const v=JSON.parse(localStorage.getItem('tthc_cols')||'null');if(Array.isArray(v))return new Set(v)}catch(e){}return new Set(['code','cat','org','by','status','upd'])};let fStatus='',fFeat='',per=10,sortKey='',sortDir='asc',colMenu=false;const sel=new Set();let cols=loadCols();
let q='',page=1,fCat='',fPar='',fOrg='',ddOpen=false;
const STORD={pub:0,draft:1,hidden:2};
const SPILL={pub:['Đã xuất bản','<circle cx="12" cy="12" r="8"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/>'],draft:['Bản nháp','<circle cx="12" cy="12" r="8"/><path d="M12 8v4l2.5 2"/>'],hidden:['Đã ẩn','<path d="M3 3l18 18M10.6 6.2A9 9 0 0112 6c5 0 8.5 4.5 9.5 6a14 14 0 01-3 3.4M6.5 7.7C4.6 9 3.3 10.7 2.5 12c1 1.5 4.5 6 9.5 6a9 9 0 003.6-.8"/>']};
const ADMIN_NAME='Admin';
const COLDEF=[['code','Mã TTHC'],['cat','Lĩnh vực'],['org','Cơ quan'],['by','Người đăng'],['status','Trạng thái'],['upd','Ngày cập nhật']];
const fdt=iso=>{if(!iso)return'—';const d=new Date(iso);if(isNaN(d))return'—';const z=n=>String(n).padStart(2,'0');return `${z(d.getHours())}:${z(d.getMinutes())}:${z(d.getSeconds())} ${z(d.getDate())}/${z(d.getMonth()+1)}/${d.getFullYear()}`};
let pageIds=[];
function listView(g){
  const grp=all.filter(d=>d.group===g),k=norm(q);
  let f=grp.filter(d=>(!fPar||d.parent===fPar)&&(!fCat||d.cat===fCat)&&(!fOrg||d.org===fOrg)&&(!fStatus||d.status===fStatus)&&(!fFeat||d.feat)&&(!k||norm(d.name+' '+d.code+' '+d.cat+' '+d.org).includes(k)));
  if(sortKey){const dir=sortDir==='asc'?1:-1;f=[...f].sort((a,b)=>{
    if(sortKey==='name')return dir*vi(a.name,b.name);
    if(sortKey==='status')return dir*((STORD[a.status]??9)-(STORD[b.status]??9));
    if(sortKey==='upd'){if(!a.upd&&!b.upd)return 0;if(!a.upd)return 1;if(!b.upd)return -1;return dir*(a.upd<b.upd?-1:a.upd>b.upd?1:0)}
    return 0})}
  const pages=Math.max(1,Math.ceil(f.length/per));if(page>pages)page=pages;
  const from=(page-1)*per,sl=f.slice(from,from+per);pageIds=sl.map(d=>d._id);
  const parents={};grp.forEach(d=>{const o=parents[d.parent]??={n:0,subs:{}};o.n++;o.subs[d.cat]=(o.subs[d.cat]||0)+1});
  const pk=Object.keys(parents).sort((a,b)=>a.localeCompare(b,'vi'));
  const J=v=>esc(JSON.stringify(v));
  const left=`<button class="catrow${!fPar?' on':''}" onclick="A.fpar('')"><span>Tất cả lĩnh vực</span><b>${grp.length}</b><i class="chv"></i></button>`+pk.map(c=>{const multi=Object.keys(parents[c].subs).length>=2;return `<button class="catrow${fPar===c?' on':''}" onclick="A.fpar(${J(c)})"><span>${esc(c)}</span><b>${parents[c].n}</b><i class="chv">${multi?ico('<path d="M9 6l6 6-6 6"/>'):''}</i></button>`}).join('');
  let right='';
  if(fPar&&parents[fPar]&&Object.keys(parents[fPar].subs).length>=2){
    const subs=parents[fPar].subs;
    right=`<div class="ddsub"><div class="dsh">${esc(fPar)}</div><button class="catrow${!fCat?' on':''}" onclick="A.fcat('')"><span>Tất cả ${esc(fPar)}</span><b>${parents[fPar].n}</b></button>`+Object.keys(subs).sort((a,b)=>a.localeCompare(b,'vi')).map(c=>`<button class="catrow${fCat===c?' on':''}" onclick="A.fcat(${J(c)})"><span>${esc(c)}</span><b>${subs[c]}</b></button>`).join('')+'</div>';
  }
  const cur=fCat||fPar||'Tất cả lĩnh vực';
  const dd=`<div class="dd"><button class="ddbtn${fPar?' has':''}" onclick="A.dd(event)"><span>${esc(cur)}</span>${ico('<path d="M6 9l6 6 6-6"/>')}</button><div class="ddmenu" ${ddOpen?'':'hidden'}><div class="ddmain">${left}</div>${right}</div></div>`;
  const orgOpts=[...new Set(grp.map(d=>d.org))].filter(Boolean).sort(vi);
  const so=(v,l,c)=>`<option value="${v}"${c===v?' selected':''}>${l}</option>`;
  const sortIc=key=>`<svg viewBox="0 0 24 24" class="sic${sortKey===key?' on':''}">${sortKey===key&&sortDir==='asc'?'<path d="M8 14l4-4 4 4"/>':sortKey===key?'<path d="M8 10l4 4 4-4"/>':'<path d="M8 9l4-4 4 4M8 15l4 4 4-4"/>'}</svg>`;
  const th=(key,label)=>`<th class="srt" onclick="A.sort('${key}')">${label}${sortIc(key)}</th>`;
  const has=c=>cols.has(c);
  const allSel=sl.length>0&&sl.every(d=>sel.has(d._id));
  const colMenuHtml=colMenu?`<div class="colmenu">${COLDEF.map(([c,l])=>`<label class="colopt"><input type="checkbox" ${has(c)?'checked':''} onchange="A.tcol('${c}')">${l}</label>`).join('')}</div>`:'';
  const rows=sl.map(d=>{const [sl2,svg]=SPILL[d.status]||SPILL.pub;return `<tr class="${sel.has(d._id)?'sel':''}"><td class="cb"><input type="checkbox" ${sel.has(d._id)?'checked':''} onchange="A.tsel(${d._id})"></td>
    <td class="nm" title="${esc(d.name)}"><span class="ell">${esc(d.name)}</span></td>
    ${has('code')?`<td class="mono">${esc(d.code)}</td>`:''}${has('cat')?`<td>${esc(d.cat)||'—'}</td>`:''}${has('org')?`<td>${esc(d.org)||'—'}</td>`:''}
    ${has('by')?`<td>${esc(d.by)||'—'}</td>`:''}${has('status')?`<td><span class="pill ${d.status}">${ico(svg)}${sl2}</span></td>`:''}${has('upd')?`<td class="mono">${fdt(d.upd)}</td>`:''}
    <td><div class="act"><button class="ib" title="Xem" onclick="A.view(${d._id})">${ico('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>')}</button><button class="ib" title="Sửa" onclick="A.edit(${d._id})">${ico('<path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/>')}</button><button class="ib del" title="Xóa" onclick="A.del(${d._id})">${ico('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>')}</button></div></td></tr>`}).join('');
  const ncol=3+COLDEF.filter(([c])=>has(c)).length;
  const chev='<path d="M6 9l6 6 6-6"/>';
  return `<div class="tbar">
    <div class="search">${ico('<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>')}<input class="inp" id="q" placeholder="Tìm kiếm tên, mã, lĩnh vực…" value="${esc(q)}" oninput="A.search(this.value)"></div>
    <select class="fsel" style="width:128px" onchange="A.fstatus(this.value)">${so('','Trạng thái',fStatus)}${so('pub','Đã xuất bản',fStatus)}${so('draft','Bản nháp',fStatus)}${so('hidden','Đã ẩn',fStatus)}</select>
    ${dd}
    <select class="fsel" style="width:132px" onchange="A.forg(this.value)">${so('','Cơ quan',fOrg)}${orgOpts.map(o=>so(esc(o),esc(o),fOrg)).join('')}</select>
    <select class="fsel" style="width:108px" onchange="A.per(this.value)">${[10,20,50,100].map(n=>so(String(n),n+' / trang',String(per))).join('')}</select>
    <div class="colw"><button class="fsel colbtn" onclick="A.colm(event)">${ico('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16M15 4v16"/>')}Cột${ico(chev)}</button>${colMenuHtml}</div>
    <div class="sp"></div>
    <div class="tbtns"><button class="btn" onclick="A.imp()">${ico('<path d="M12 16V4M7 9l5-5 5 5M4 17v3h16v-3"/>')}Nhập Excel</button><button class="btn" onclick="A.exp()">${ico('<path d="M12 4v12M7 11l5 5 5-5M4 17v3h16v-3"/>')}Xuất Excel</button><button class="btn pri" onclick="A.add('${g}')">${ico('<path d="M12 5v14M5 12h14"/>')}Thêm thủ tục</button></div>
  </div>
  ${sel.size?`<div class="bulk">Đã chọn <b>${sel.size}</b> thủ tục<button class="btn red sm" onclick="A.bdel()">${ico('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>')}Xóa đã chọn</button><button class="btn sm" onclick="A.bclr()">Bỏ chọn</button></div>`:''}
  <div class="card"><div class="tw"><table class="lt"><thead><tr><th class="cb"><input type="checkbox" ${allSel?'checked':''} onchange="A.tall()" title="Chọn tất cả trên trang"></th>${th('name','Tiêu đề')}${has('code')?'<th>Mã TTHC</th>':''}${has('cat')?'<th>Lĩnh vực</th>':''}${has('org')?'<th>Cơ quan</th>':''}${has('by')?'<th>Người đăng</th>':''}${has('status')?th('status','Trạng thái'):''}${has('upd')?th('upd','Ngày cập nhật'):''}<th style="text-align:right">Thao tác</th></tr></thead><tbody>
  ${rows||`<tr><td colspan="${ncol}" class="empty">Không có thủ tục nào phù hợp.</td></tr>`}
  </tbody></table></div>
  <div class="pg"><span>${f.length?`Hiển thị ${from+1}–${Math.min(from+per,f.length)} / ${f.length} thủ tục`:'0 thủ tục'}</span><div class="pgb"><button ${page<=1?'disabled':''} onclick="A.page(1)" title="Trang đầu">«</button><button ${page<=1?'disabled':''} onclick="A.page(${page-1})">‹</button><span class="pgt">Trang ${page} / ${pages}</span><button ${page>=pages?'disabled':''} onclick="A.page(${page+1})">›</button><button ${page>=pages?'disabled':''} onclick="A.page(${pages})" title="Trang cuối">»</button></div></div></div>`;
}

const X='<path d="M6 6l12 12M18 6L6 18"/>';
const toRow=d=>{const r=[d.name,d.cat,d.code,d.source,d.group,d.org];if(d.big||d.by||d.desc||d.content||(d.kw&&d.kw.length)||d.feat||d.status!=='pub'||d.upd)r.push({big:d.big||'',by:d.by||'',desc:d.desc||'',content:d.content||'',kw:d.kw||[],feat:!!d.feat,status:d.status||'pub',upd:d.upd||''});return r};
const save=()=>localStorage.setItem(STORE_KEY,JSON.stringify(all.map(toRow)));
// Thủ tục cũ chưa có người đăng / ngày cập nhật: ghi nhận một lần là đã được Admin nhập vào hệ thống lúc mở trang quản trị
(()=>{const miss=all.filter(d=>!d.upd||!d.by);if(!miss.length)return;const now=new Date().toISOString();miss.forEach(d=>{if(!d.upd)d.upd=now;if(!d.by)d.by='Admin'});save()})();
const show=(title,body,foot)=>{$('mbox').innerHTML=`<div class="mh"><h3>${title}</h3><button class="ib" onclick="A.closeModal()" aria-label="Đóng">${ico(X)}</button></div><div class="mb">${body}</div><div class="mf">${foot}</div>`;$('mwrap').classList.add('on')};
const GN=g=>g==='tthc'?'Thủ tục hành chính':'Thủ tục phi địa giới';
function openForm(id,g){
  const d=id?all.find(x=>x._id===id):null;
  form={id:id||0,g:d?d.group:g};kw=d?[...(d.kw||[])]:[];srcMode=false;
  document.getElementById('mwrap').classList.remove('on');
  render();scrollTo(0,0);
}
const STL={pub:'Đã xuất bản',draft:'Bản nháp',hidden:'Ẩn (không hiện ở trang tra cứu)'};
function formView(){
  const d=form.id?all.find(x=>x._id===form.id):{name:'',code:'',cat:'',org:'',source:'',desc:'',content:'',feat:false,status:'pub',upd:'',group:form.g};
  const dl=(k,ls)=>`<datalist id="dl_${k}">${[...new Set(all.map(x=>x[ls]))].filter(Boolean).sort().map(v=>`<option value="${esc(v)}">`).join('')}</datalist>`;
  const tb=(cmd,svg,t)=>`<button type="button" class="tbb" title="${t}" onmousedown="event.preventDefault()" onclick="A.cmd('${cmd}')">${svg}</button>`;
  const I=p=>ico(p);
  return `<div class="fpage"><div class="fhead"><button class="ib" onclick="A.cancel()" title="Quay lại">${I('<path d="M19 12H5M11 6l-6 6 6 6"/>')}</button><h2>${form.id?'Cập nhật thủ tục':'Thêm thủ tục mới'}</h2></div>
  <div class="fgrid"><div class="fmain">
    <div class="card fc"><div class="fld"><label>Tên thủ tục <i>*</i></label><input class="inp" id="f_name" value="${esc(d.name)}"></div>
      <div class="fld"><label>Đường link thủ tục</label><input class="inp" id="f_link" placeholder="https://dichvucong.gov.vn/…" value="${esc(d.source)}"><div class="hint">Link tra cứu hoặc giải quyết trên Cổng Dịch vụ công. Để trống thì tự dùng link tìm theo mã TTHC.</div></div></div>
    <div class="card fc"><div class="fld"><label>Nội dung chi tiết</label>
      <div class="ed"><div class="edbar">
        <button type="button" class="tbb wide" onmousedown="event.preventDefault()" onclick="A.src()">${I('<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/>')}Source</button><i class="sep"></i>
        ${tb('undo',I('<path d="M9 14L4 9l5-5M4 9h10a6 6 0 010 12h-3"/>'),'Hoàn tác')}${tb('redo',I('<path d="M15 14l5-5-5-5M20 9H10a6 6 0 000 12h3"/>'),'Làm lại')}<i class="sep"></i>
        <select class="tbs" onchange="A.fmt(this.value);this.value=''"><option value="">Đoạn văn</option><option value="P">Đoạn văn</option><option value="H2">Tiêu đề 2</option><option value="H3">Tiêu đề 3</option><option value="H4">Tiêu đề 4</option></select><i class="sep"></i>
        ${tb('bold','<b>B</b>','Đậm')}${tb('italic','<i>I</i>','Nghiêng')}${tb('underline','<u>U</u>','Gạch chân')}${tb('strikeThrough','<s>S</s>','Gạch ngang')}<i class="sep"></i>
        ${tb('justifyLeft',I('<path d="M4 6h16M4 10h10M4 14h16M4 18h10"/>'),'Căn trái')}${tb('justifyCenter',I('<path d="M4 6h16M7 10h10M4 14h16M7 18h10"/>'),'Căn giữa')}${tb('insertUnorderedList',I('<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>'),'Danh sách chấm')}${tb('insertOrderedList',I('<path d="M10 6h10M10 12h10M10 18h10M4 5l1-1v4M4 14h2l-2 3h2"/>'),'Danh sách số')}${tb('blockquote',I('<path d="M5 8h5v5H7a2 2 0 002 3M14 8h5v5h-3a2 2 0 002 3"/>'),'Trích dẫn')}<i class="sep"></i>
        ${tb('link',I('<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/>'),'Chèn liên kết')}${tb('insertHorizontalRule',I('<path d="M4 12h16"/>'),'Đường kẻ ngang')}${tb('removeFormat',I('<path d="M5 5h10M10 5l-3 14M14 14l6 6M20 14l-6 6"/>'),'Xóa định dạng')}
      </div><div class="edbody" id="f_ed" contenteditable="true" data-ph="Nhập thành phần hồ sơ, trình tự, thời hạn, phí, lệ phí…">${sanitize(d.content)}</div><textarea class="edsrc" id="f_src" hidden spellcheck="false"></textarea></div></div></div>
  </div><aside class="fside">
    <div class="card fc"><h5>${I('<path d="M7 3h7l5 5v13H7zM14 3v5h5"/>')}Thông tin thủ tục</h5>
      <div class="fld"><label>Mã TTHC <i>*</i></label><input class="inp" id="f_code" placeholder="VD: 1.004.746" value="${esc(d.code)}"></div>
      <div class="fld"><label>Nhóm</label><select class="sel full" id="f_group" onchange="A.grpChg()"><option value="tthc"${d.group==='tthc'?' selected':''}>Thủ tục hành chính</option><option value="phidiagioi"${d.group==='phidiagioi'?' selected':''}>Thủ tục phi địa giới</option></select></div>
</div>
    <div class="card fc"><h5>${I('<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>')}Phân loại</h5>
      <div class="fld"><label>Lĩnh vực <i>*</i></label><select class="sel full" id="f_big" onchange="A.bigChg()"></select><input class="inp newin" id="f_big_new" placeholder="Nhập tên lĩnh vực mới" hidden></div>
      <div class="fld"><label>Lĩnh vực chuyên môn <i>*</i></label><select class="sel full" id="f_cat" onchange="A.catChg()"></select><input class="inp newin" id="f_cat_new" placeholder="Nhập tên lĩnh vực chuyên môn mới" hidden><div class="hint">Chọn lĩnh vực trước, danh sách chuyên môn sẽ hiện theo lĩnh vực đó.</div></div>
      <div class="fld"><label>Cơ quan</label><input class="inp" id="f_org" list="dl_org" value="${esc(d.org)}">${dl('org','org')}</div></div>
  </aside></div>
  <div class="factions"><button class="btn" onclick="A.cancel()">Hủy</button><button class="btn pri" onclick="A.saveForm(false)">${ico('<path d="M5 4h11l3 3v13H5zM8 4v5h7V4M8 20v-6h8v6"/>')}${form.id?'Cập nhật':'Thêm mới'}</button></div></div>`;
}
const NEWV='__new';
const vi=(a,b)=>a.localeCompare(b,'vi');
function classMap(){const m={};catalog($('f_group').value).forEach((sm,b)=>{m[b]=new Set(sm.keys())});return m}
function fillSel(id,list,cur,ph,addLabel){
  const el=$('f_'+id),isNew=cur&&!list.includes(cur);
  el.innerHTML=`<option value=""${!cur?' selected':''} disabled>${ph}</option>`+list.map(v=>`<option value="${esc(v)}"${v===cur?' selected':''}>${esc(v)}</option>`).join('')+`<option value="${NEWV}"${isNew?' selected':''}>＋ ${addLabel}</option>`;
  const n=$('f_'+id+'_new');n.hidden=el.value!==NEWV;if(isNew)n.value=cur;
}
function selVal(id){const v=$('f_'+id).value;return v===NEWV?$('f_'+id+'_new').value.trim():v}
function fillClass(big,cat){
  const m=classMap();fillSel('big',Object.keys(m).sort(vi),big,'Chọn lĩnh vực','Thêm lĩnh vực mới…');fillCls2(cat);
}
function fillCls2(cat){
  const m=classMap(),big=selVal('big'),list=big&&m[big]?[...m[big]].sort(vi):[];
  fillSel('cat',list,cat,big?'Chọn lĩnh vực chuyên môn':'Chọn lĩnh vực trước','Thêm chuyên môn mới…');
}
function bigChanged(){
  $('f_big_new').hidden=$('f_big').value!==NEWV;fillCls2('');
  const big=selVal('big');if(big&&!$('f_org').value.trim()){const c={};all.filter(x=>x.parent===big).forEach(x=>{if(x.org)c[x.org]=(c[x.org]||0)+1});const t=Object.entries(c).sort((a,b)=>b[1]-a[1])[0];if(t)$('f_org').value=t[0]}
}
function initForm(){
  const d=form.id?all.find(x=>x._id===form.id):null;
  fillClass(d?d.parent:'',d?d.cat:'');$('f_name').focus();
}
function saveForm(){
  const v=k=>$('f_'+k).value.trim();
  let code=v('code');if(/^\d{7}$/.test(code))code=code.replace(/^(\d)(\d{3})(\d{3})$/,'$1.$2.$3');
  const big=selVal('big'),cat=selVal('cat');
  if(!v('name')||!code||!big||!cat){toast('Vui lòng nhập Tên thủ tục, Mã TTHC, Lĩnh vực và Lĩnh vực chuyên môn',1);return}
  if(v('link')&&!/^https?:\/\//i.test(v('link'))){toast('Đường link phải bắt đầu bằng http:// hoặc https://',1);return}
  if(all.some(x=>x._id!==form.id&&x.code===code)&&!confirm('Mã TTHC '+code+' đã có ở thủ tục khác. Vẫn lưu?'))return;
  let html=sanitize(srcMode?$('f_src').value:$('f_ed').innerHTML);
  if(!html.replace(/<[^>]*>|&nbsp;|\s/g,''))html='';
  const prev=form.id?all.find(x=>x._id===form.id):null;
  const o={name:v('name'),cat,big,code,by:(prev&&prev.by)||ADMIN_NAME,source:v('link'),org:v('org'),group:v('group'),content:html,status:'pub',upd:new Date().toISOString()};
  const isNew=!form.id;
  if(isNew){all.unshift({...o,_id:++uid});page=1;q='';fCat='';fPar='';fOrg=''}else Object.assign(all.find(x=>x._id===form.id),o);
  save();calcParent();form=null;render();scrollTo(0,0);toast(isNew?'Đã thêm thủ tục':'Đã cập nhật thủ tục');
}
function editorCmd(c){
  if(srcMode)return;$('f_ed').focus();
  if(c==='link'){const u=prompt('Nhập đường link (https://…)');if(u&&/^(https?:|mailto:)/i.test(u.trim()))document.execCommand('createLink',false,u.trim());else if(u)toast('Link phải bắt đầu bằng http://, https:// hoặc mailto:',1);return}
  if(c==='blockquote'){document.execCommand('formatBlock',false,'BLOCKQUOTE');return}
  document.execCommand(c,false,null);
}
function editorFmt(t){if(t&&!srcMode){$('f_ed').focus();document.execCommand('formatBlock',false,t)}}
function toggleSrc(){
  const ed=$('f_ed'),sr=$('f_src');srcMode=!srcMode;
  if(srcMode){sr.value=ed.innerHTML;sr.hidden=false;ed.hidden=true}else{ed.innerHTML=sanitize(sr.value);sr.hidden=true;ed.hidden=false}
}
function viewItem(id){
  const d=all.find(x=>x._id===id);
  const link=d.source||`https://dichvucong.gov.vn/dvc-ketqua-thu-tuc?keyword=${encodeURIComponent(d.code)}`;
  const r=(l,v)=>`<div class="vr"><span>${l}</span><div>${v}</div></div>`;
  show('Chi tiết thủ tục',`<h4 class="vt">${esc(d.name)}</h4>${r('Mã TTHC',esc(d.code))}${r('Nhóm',GN(d.group))}${r('Lĩnh vực',esc(d.cat))}${r('Lĩnh vực lớn',esc(d.parent))}${r('Cơ quan',esc(d.org)||'—')}${r('Người đăng',esc(d.by)||'—')}${r('Ngày cập nhật',fdt(d.upd))}${r('Trạng thái',STL[d.status]||'')}${d.desc?r('Mô tả',esc(d.desc)):''}${r('Đường link',`<a href="${esc(link)}" target="_blank" rel="noopener">${esc(link)}</a>${d.source?'':' <small style="color:var(--mut)">(link tìm theo mã)</small>'}`)}`,
  `<button class="btn" onclick="A.closeModal()">Đóng</button><button class="btn pri" onclick="A.edit(${id})">Sửa</button>`);
}
function delItem(id){
  const d=all.find(x=>x._id===id);
  show('Xóa thủ tục',`<p>Bạn có chắc muốn xóa thủ tục này?</p><p><b>${esc(d.name)}</b><br><span style="color:var(--mut);font-size:13px">Mã: ${esc(d.code)}</span></p>`,
  `<button class="btn" onclick="A.closeModal()">Hủy</button><button class="btn red" onclick="A.doDel(${id})">Xóa</button>`);
}
function doDel(id){all=all.filter(x=>x._id!==id);save();calcParent();A.closeModal();render()}

/* ---------- Nhập / xuất Excel ---------- */
function toast(m,err){const t=document.createElement('div');t.className='toast'+(err?' err':'');t.textContent=m;$('toasts').appendChild(t);setTimeout(()=>t.remove(),3500)}
const COLS={name:/ten thu tuc|ten tthc|^thu tuc/,cat:/linh vuc/,code:/^ma\b|ma (tthc|thu tuc)|ma so/,link:/link|duong dan|url/,group:/nhom|loai/,org:/co quan|don vi/};
const GLBL=g=>g==='phidiagioi'?'Phi địa giới':'Thủ tục hành chính';
const HEAD=['Tên thủ tục','Lĩnh vực','Mã TTHC','Link','Nhóm','Cơ quan'];
const fixCode=c=>{c=String(c||'').trim();return /^\d{7}$/.test(c)?c.replace(/^(\d)(\d{3})(\d{3})$/,'$1.$2.$3'):c};
function parseSheet(ws,sheetName,defG){
  const a=XLSX.utils.sheet_to_json(ws,{header:1,defval:'',raw:false});
  let h=-1,map={};
  for(let i=0;i<Math.min(a.length,15);i++){const m={};a[i].forEach((c,j)=>{const t=norm(c);if(!t)return;for(const k in COLS)if(!(k in m)&&COLS[k].test(t)){m[k]=j;break}});
    if('name' in m&&Object.keys(m).length>=2){h=i;map=m;break}}
  if(h<0)return[];
  const out=[];
  for(let i=h+1;i<a.length;i++){
    const r=a[i],g=k=>k in map?String(r[map[k]]??'').trim():'';
    const name=g('name');if(!name)continue;
    let link=g('link');
    if(!link){const c=ws[XLSX.utils.encode_cell({r:i,c:map.name})];if(c&&c.l&&c.l.Target)link=c.l.Target}
    const gv=g('group');
    const group=gv?(/phi/.test(norm(gv))?'phidiagioi':'tthc'):(/phi/.test(norm(sheetName))?'phidiagioi':defG);
    out.push({name,cat:g('cat')||'Chưa phân loại',code:fixCode(g('code')),source:link,group,org:g('org')});
  }
  return out;
}
let pending=[],curG='tthc';
function pickFile(){curG=VGRP();$('fileIn').value='';$('fileIn').click()}
$('fileIn').addEventListener('change',async e=>{
  const f=e.target.files[0];if(!f)return;
  try{
    const wb=XLSX.read(await f.arrayBuffer(),{type:'array'});
    pending=wb.SheetNames.flatMap(n=>parseSheet(wb.Sheets[n],n,curG));
    if(!pending.length){toast('Không nhận ra cột "Tên thủ tục" trong file. Hãy dùng file mẫu.',1);return}
    const bad=pending.filter(d=>!d.code).length;
    show('Xem trước dữ liệu nhập',`<p>Đọc được <b>${pending.length}</b> thủ tục từ <b>${esc(f.name)}</b>${bad?` (<span style="color:var(--red)">${bad} dòng thiếu mã TTHC sẽ bị bỏ qua</span>)`:''}. Dòng không có lĩnh vực được xếp vào “Chưa phân loại”.</p>
    <div class="prev"><table><thead><tr><th>Tên thủ tục</th><th>Mã</th><th>Lĩnh vực</th><th>Nhóm</th></tr></thead><tbody>${pending.slice(0,8).map(d=>`<tr><td>${esc(d.name)}</td><td>${esc(d.code)}</td><td>${esc(d.cat)}</td><td>${GLBL(d.group)}</td></tr>`).join('')}</tbody></table></div>
    <label class="radio"><input type="radio" name="mode" value="add" checked><div><b>Thêm vào danh sách hiện có</b><span>Bỏ qua thủ tục đã có (trùng mã và tên).</span></div></label>
    <label class="radio"><input type="radio" name="mode" value="replace"><div><b>Thay thế danh sách</b><span>Xóa các thủ tục cùng nhóm với dữ liệu trong file rồi nhập mới.</span></div></label>
    <a class="tpl" onclick="A.tpl()">Tải file Excel mẫu</a>`,
    `<button class="btn" onclick="A.closeModal()">Hủy</button><button class="btn pri" onclick="A.doImport()">Nhập dữ liệu</button>`);
  }catch(err){toast('Không đọc được file: '+err.message,1)}
});
function doImport(){
  const mode=document.querySelector('input[name=mode]:checked').value;
  const items=pending.filter(d=>d.code),skipped=pending.length-items.length;
  if(mode==='replace'){const gs=new Set(items.map(d=>d.group));all=all.filter(d=>!gs.has(d.group));items.forEach(d=>all.push({...d,by:ADMIN_NAME,upd:new Date().toISOString(),_id:++uid}));toast(`Đã thay thế bằng ${items.length} thủ tục`+(skipped?` (bỏ ${skipped} dòng thiếu mã)`:''))}
  else{const key=d=>d.code+'|'+norm(d.name),have=new Set(all.map(key));let n=0;
    items.forEach(d=>{if(!have.has(key(d))){have.add(key(d));all.push({...d,by:ADMIN_NAME,upd:new Date().toISOString(),_id:++uid});n++}});
    toast(`Đã thêm ${n} thủ tục mới`+(items.length-n?`, bỏ qua ${items.length-n} dòng trùng`:'')+(skipped?`, ${skipped} dòng thiếu mã`:''))}
  save();calcParent();A.closeModal();page=1;q='';fCat='';fPar='';fOrg='';render();
}
function dl(aoa,name){const ws=XLSX.utils.aoa_to_sheet(aoa);ws['!cols']=[{wch:70},{wch:28},{wch:12},{wch:60},{wch:20},{wch:30}];const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Thủ tục');XLSX.writeFile(wb,name)}
const template=()=>dl([HEAD,['Thủ tục đăng ký lại kết hôn','Hộ tịch','1.004.746','https://dichvucong.gov.vn/…','Thủ tục hành chính','Sở Tư pháp'],['(Cột Nhóm: “Thủ tục hành chính” hoặc “Phi địa giới”)','','','','','']],'mau-nhap-thu-tuc.xlsx');
function exportX(){const g=VGRP(),l=all.filter(d=>d.group===g);dl([HEAD,...l.map(d=>[d.name,d.cat,d.code,d.source,GLBL(d.group),d.org])],g==='tthc'?'thu-tuc-hanh-chinh.xlsx':'thu-tuc-phi-dia-gioi.xlsx');toast(`Đã xuất ${l.length} thủ tục`)}

/* ---------- Danh mục lĩnh vực (lĩnh vực + lĩnh vực chuyên môn) ---------- */
const CAT_KEY='tthc_cats_v1';
let cats=[];try{cats=JSON.parse(localStorage.getItem(CAT_KEY)||'[]')}catch(e){}
const saveCats=()=>localStorage.setItem(CAT_KEY,JSON.stringify(cats));
let fsel='',fq='',fmenu=null;
const J=v=>esc(JSON.stringify(v));
// Danh mục hiện có = lĩnh vực đã nhập sẵn + lĩnh vực suy ra từ các thủ tục. Trả về Map: lĩnh vực -> Map(chuyên môn -> số thủ tục)
function catalog(){
  const m=new Map();
  cats.forEach(b=>{const sm=m.get(b.name)||new Map();b.subs.forEach(x=>sm.has(x)||sm.set(x,0));m.set(b.name,sm)});
  all.forEach(d=>{if(!m.has(d.parent))m.set(d.parent,new Map());const sm=m.get(d.parent);sm.set(d.cat,(sm.get(d.cat)||0)+1)});
  return m;
}
const sumMap=sm=>[...sm.values()].reduce((a,b)=>a+b,0);
const DOTS='<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>';
const PEN='<path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/>';
function menuBtn(key,items){return `<div class="mn"><button class="ib" title="Thêm" onclick="event.stopPropagation();A.fm(${J(key)})">${ico(DOTS)}</button>${fmenu===key?`<div class="mnl">${items}</div>`:''}</div>`}
function fieldsView(){
  const m=catalog();
  if(fsel&&!m.has(fsel))fsel='';
  const allBigs=[...m.keys()].sort(vi),k=norm(fq),bigs=allBigs.filter(b=>!k||norm(b).includes(k));
  const nsub=allBigs.reduce((a,b)=>a+m.get(b).size,0);
  const left=bigs.map(b=>`<div class="mrow${fsel===b?' on':''}" onclick="A.fsel(${J(b)})"><span class="mname">${esc(b)}</span><span class="mcnt">${m.get(b).size} chuyên môn</span>${menuBtn('b:'+b,`<button onclick="A.fm(null);A.renBig(${J(b)})">${ico(PEN)}Đổi tên</button><button class="del" onclick="A.fm(null);A.delBig(${J(b)})">${ico('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>')}Xóa</button>`)}</div>`).join('')
    ||`<div class="mempty">${fq?'Không tìm thấy lĩnh vực phù hợp.':'Chưa có lĩnh vực nào. Bấm “Thêm lĩnh vực” để nhập.'}</div>`;
  let right;
  if(!fsel){
    right=`<div class="rempty"><div class="folder">${ico('<path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>')}</div><p>Chọn lĩnh vực bên trái để quản lý chuyên môn trực thuộc.</p></div>`;
  }else{
    const sm=m.get(fsel),subs=[...sm.keys()].sort(vi);
    right=`<div class="rhead"><div><div class="rtitle">${ico('<rect x="9" y="3" width="6" height="5" rx="1"/><rect x="3" y="16" width="6" height="5" rx="1"/><rect x="15" y="16" width="6" height="5" rx="1"/><path d="M12 8v4M6 16v-4h12v4"/>')}Chuyên môn thuộc lĩnh vực</div><div class="rsel">${esc(fsel)}</div></div><button class="btn pri" onclick="A.addSub(${J(fsel)})">${ico('<path d="M12 5v14M5 12h14"/>')}Thêm chuyên môn</button></div>
    <div class="tw"><table class="subtbl"><thead><tr><th>Tên chuyên môn</th><th>Số thủ tục</th><th style="text-align:right">Thao tác</th></tr></thead><tbody>${subs.map(x=>`<tr><td>${esc(x)}</td><td>${sm.get(x)} thủ tục</td><td><div class="act"><button class="ib" title="Đổi tên" onclick="A.renSub(${J(fsel)},${J(x)})">${ico(PEN)}</button>${menuBtn('s:'+x,`<button class="del" onclick="A.fm(null);A.delSub(${J(fsel)},${J(x)})">${ico('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>')}Xóa</button>`)}</div></td></tr>`).join('')||'<tr><td colspan="3" class="empty">Chưa có chuyên môn nào. Bấm “Thêm chuyên môn” để nhập.</td></tr>'}</tbody></table></div>`;
  }
  return `<div class="fbar"><span class="chip2">${allBigs.length} lĩnh vực · ${nsub} chuyên môn</span></div>
  <div class="mdgrid"><section class="card mdl"><div class="mdh"><h3>${ico('<path d="M12 3l9 5-9 5-9-5 9-5zM3 12.5l9 5 9-5M3 16.5l9 5 9-5"/>')}Lĩnh vực</h3><button class="btn pri sm" onclick="A.addBig()">${ico('<path d="M12 5v14M5 12h14"/>')}Thêm lĩnh vực</button></div>
    <div class="search sm">${ico('<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>')}<input class="inp" id="fq" placeholder="Tìm lĩnh vực…" value="${esc(fq)}" oninput="A.fsrch(this.value)"></div>
    <div class="mlist">${left}</div></section>
  <section class="card mdr">${right}</section></div>`;
}
const lines=t=>[...new Set(String(t||'').split(/\n/).map(x=>x.trim()).filter(Boolean))];
const entry=(g,name)=>cats.find(b=>b.name===name);
const btns=(ok)=>`<button class="btn" onclick="A.closeModal()">Hủy</button><button class="btn pri" onclick="${ok}">Lưu</button>`;
function addBig(){
  show('Thêm lĩnh vực',`<div class="fld"><label>Tên lĩnh vực <i>*</i></label><input class="inp" id="c_name" placeholder="VD: Lao động - Thương binh và Xã hội"></div>
  <div class="fld"><label>Các lĩnh vực chuyên môn</label><textarea class="txt" id="c_subs" style="min-height:130px" placeholder="Mỗi dòng một lĩnh vực chuyên môn&#10;VD:&#10;Việc làm&#10;Bảo trợ xã hội"></textarea><div class="hint">Không bắt buộc, có thể thêm sau.</div></div>`,btns('A.doAddBig()'));
  $('c_name').focus();
}
function doAddBig(){
  const name=$('c_name').value.trim(),subs=lines($('c_subs').value);
  if(!name){toast('Vui lòng nhập tên lĩnh vực',1);return}
  if(catalog().has(name)){toast('Lĩnh vực này đã có',1);return}
  cats.push({g:'tthc',name,subs});saveCats();A.closeModal();render();toast(`Đã thêm lĩnh vực “${name}”`);
}
function addSub(big){
  show(`Thêm chuyên môn · ${esc(big)}`,`<div class="fld"><label>Lĩnh vực chuyên môn <i>*</i></label><textarea class="txt" id="c_subs" style="min-height:130px" placeholder="Mỗi dòng một lĩnh vực chuyên môn"></textarea><div class="hint">Nhập nhiều mục cùng lúc: mỗi dòng một mục.</div></div>`,btns(`A.doAddSub(${J(big)})`));
  $('c_subs').focus();
}
function doAddSub(big){
  const add=lines($('c_subs').value);if(!add.length){toast('Vui lòng nhập tên chuyên môn',1);return}
  const have=catalog().get(big)||new Map(),nw=add.filter(x=>!have.has(x));
  if(!nw.length){toast('Các mục này đã có',1);return}
  let e=entry('',big);if(!e){e={g:'tthc',name:big,subs:[]};cats.push(e)}
  e.subs.push(...nw);saveCats();A.closeModal();render();toast(`Đã thêm ${nw.length} chuyên môn`+(add.length-nw.length?`, bỏ qua ${add.length-nw.length} mục trùng`:''));
}
function renBig(old){
  show('Đổi tên lĩnh vực',`<div class="fld"><label>Tên lĩnh vực</label><input class="inp" id="c_name" value="${esc(old)}"><div class="hint">Áp dụng cho tất cả thủ tục thuộc lĩnh vực này.</div></div>`,btns(`A.doRenBig(${J(old)})`));
  $('c_name').focus();$('c_name').select();
}
function doRenBig(old){
  const nw=$('c_name').value.trim();if(!nw){toast('Tên không được để trống',1);return}
  if(nw===old){A.closeModal();return}
  if(catalog().has(nw)){toast('Đã có lĩnh vực trùng tên',1);return}
  all.forEach(d=>{if(d.parent===old)d.big=nw});
  cats.forEach(b=>{if(b.name===old)b.name=nw});if(fsel===old)fsel=nw;
  save();saveCats();calcParent();A.closeModal();render();toast('Đã đổi tên lĩnh vực');
}
function renSub(big,old){
  show('Đổi tên chuyên môn',`<div class="fld"><label>Tên lĩnh vực chuyên môn</label><input class="inp" id="c_name" value="${esc(old)}"><div class="hint">Áp dụng cho tất cả thủ tục thuộc chuyên môn này.</div></div>`,btns(`A.doRenSub(${J(big)},${J(old)})`));
  $('c_name').focus();$('c_name').select();
}
function doRenSub(big,old){
  const nw=$('c_name').value.trim();if(!nw){toast('Tên không được để trống',1);return}
  if(nw===old){A.closeModal();return}
  if((catalog().get(big)||new Map()).has(nw)){toast('Đã có chuyên môn trùng tên',1);return}
  all.forEach(d=>{if(d.parent===big&&d.cat===old){d.cat=nw;d.big=big}});
  cats.forEach(b=>{if(b.name===big)b.subs=b.subs.map(x=>x===old?nw:x)});
  save();saveCats();calcParent();A.closeModal();render();toast('Đã đổi tên chuyên môn');
}
function delSub(big,sub){
  const n=(catalog().get(big)||new Map()).get(sub)||0;
  if(n){toast(`Còn ${n} thủ tục thuộc “${sub}”. Hãy chuyển các thủ tục sang chuyên môn khác trước khi xóa.`,1);return}
  show('Xóa chuyên môn',`<p>Xóa lĩnh vực chuyên môn <b>${esc(sub)}</b> khỏi <b>${esc(big)}</b>?</p>`,`<button class="btn" onclick="A.closeModal()">Hủy</button><button class="btn red" onclick="A.doDelSub(${J(big)},${J(sub)})">Xóa</button>`);
}
function doDelSub(big,sub){cats.forEach(b=>{if(b.name===big)b.subs=b.subs.filter(x=>x!==sub)});saveCats();A.closeModal();render();toast('Đã xóa chuyên môn')}
function delBig(big){
  const sm=catalog().get(big)||new Map(),n=sumMap(sm);
  if(n){toast(`Còn ${n} thủ tục thuộc lĩnh vực “${big}”. Hãy chuyển các thủ tục sang lĩnh vực khác trước khi xóa.`,1);return}
  show('Xóa lĩnh vực',`<p>Xóa lĩnh vực <b>${esc(big)}</b>${sm.size?` cùng ${sm.size} chuyên môn bên trong`:''}?</p>`,`<button class="btn" onclick="A.closeModal()">Hủy</button><button class="btn red" onclick="A.doDelBig(${J(big)})">Xóa</button>`);
}
function doDelBig(big){cats=cats.filter(b=>b.name!==big);if(fsel===big)fsel='';saveCats();A.closeModal();render();toast('Đã xóa lĩnh vực')}
window.A={
  fstatus:v=>{fStatus=v;page=1;sel.clear();render()},ffeat:v=>{fFeat=v;page=1;sel.clear();render()},per:v=>{per=+v;page=1;render()},
  colm:e=>{e.stopPropagation();colMenu=!colMenu;render()},
  tcol:c=>{cols.has(c)?cols.delete(c):cols.add(c);localStorage.setItem('tthc_cols',JSON.stringify([...cols]));render()},
  sort:k=>{if(sortKey!==k){sortKey=k;sortDir='asc'}else if(sortDir==='asc')sortDir='desc';else{sortKey='';sortDir='asc'}render()},
  tsel:id=>{sel.has(id)?sel.delete(id):sel.add(id);render()},
  tall:()=>{const all2=pageIds.every(i=>sel.has(i));pageIds.forEach(i=>all2?sel.delete(i):sel.add(i));render()},
  bclr:()=>{sel.clear();render()},
  bdel:()=>show('Xóa các thủ tục đã chọn',`<p>Bạn có chắc muốn xóa <b>${sel.size}</b> thủ tục đã chọn? Thao tác này không hoàn tác được.</p>`,`<button class="btn" onclick="A.closeModal()">Hủy</button><button class="btn red" onclick="A.doBdel()">Xóa ${sel.size} thủ tục</button>`),
  doBdel:()=>{const n=sel.size;all=all.filter(d=>!sel.has(d._id));sel.clear();save();calcParent();A.closeModal();render();toast(`Đã xóa ${n} thủ tục`)},
addBig,doAddBig,addSub,doAddSub,renBig,doRenBig,renSub,doRenSub,delSub,doDelSub,delBig,doDelBig,fsel:b=>{fsel=b;fmenu=null;render()},fm:k=>{fmenu=k===null||fmenu===k?null:k;render()},fsrch:v=>{fq=v;render();const e=$('fq');e.focus();e.setSelectionRange(v.length,v.length)},bigChg:bigChanged,catChg:()=>{$('f_cat_new').hidden=$('f_cat').value!==NEWV},grpChg:()=>fillClass('',''),cmd:editorCmd,fmt:editorFmt,src:toggleSrc,cancel(){form=null;render();scrollTo(0,0)},imp:pickFile,exp:exportX,tpl:template,doImport,view:viewItem,edit:id=>openForm(id),del:delItem,doDel,saveForm,dd(e){e.stopPropagation();ddOpen=!ddOpen;render()},fpar(v){fPar=v;fCat='';page=1;const m={};all.forEach(d=>{if(d.group===VGRP())(m[d.parent]??=new Set()).add(d.cat)});ddOpen=!!v&&m[v]&&m[v].size>=2;render()},fcat(v){fCat=v;ddOpen=false;page=1;sel.clear();render()},forg(v){fOrg=v;page=1;sel.clear();render()},add:g=>openForm(0,g),page(p){page=p;render();scrollTo(0,0)},search(v){q=v;page=1;sel.clear();render();const e=$('q');e.focus();e.setSelectionRange(v.length,v.length)},toggle(){open=!open;render()},go(v){form=null;view=v;ddOpen=false;colMenu=false;sel.clear();fStatus='';fFeat='';sortKey='';q='';fCat='';fPar='';fOrg='';page=1;A.menu(false);render()},menu(on){$('side').classList.toggle('on',on);$('sback').classList.toggle('on',on)},closeModal(){$('mwrap').classList.remove('on')}};
render();

document.addEventListener('click',e=>{if(ddOpen&&!e.target.closest('.dd')){ddOpen=false;render()}if(fmenu&&!e.target.closest('.mn')){fmenu=null;render()}if(colMenu&&!e.target.closest('.colw')){colMenu=false;render()}});
