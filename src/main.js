import './style.css';
import { data } from './data.js';
import { applyExtraLinks } from './links.js';
import extraLinks from './links-bo-sung.csv?raw';

applyExtraLinks(data, extraLinks);

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
down:'<path d="M6 9l6 6 6-6"/>'};
const catIcon={'Sở Quy hoạch - Kiến trúc':'building','Công an Thành phố':'badge','Sở Giáo dục và Đào tạo':'book','Sở Công Thương':'store','Sở Y tế':'heart','Sở Tư pháp':'scale','Sở Nông nghiệp và Môi trường':'leaf','Sở Du lịch':'pin','Sở Xây dựng':'building','Sở Tài chính':'coin','Sở Khoa học và Công nghệ':'flask','Sở Nội vụ':'users','Sở Văn hóa và Thể thao':'star','Sở An toàn thực phẩm':'shield','Sở Dân tộc và Tôn giáo':'flag'};
const short={'Sở Giáo dục và Đào tạo':'Giáo dục & Đào tạo','Sở Nông nghiệp và Môi trường':'Nông nghiệp & Môi trường','Sở Khoa học và Công nghệ':'Khoa học & Công nghệ','Sở Văn hóa và Thể thao':'Văn hóa & Thể thao','Sở Dân tộc và Tôn giáo':'Dân tộc & Tôn giáo'};
function label(c){return short[c]||c.replace(/^Sở /,'')}
function ico(k,w){return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w||1.6}" stroke-linecap="round" stroke-linejoin="round">${P[k]||P.file}</svg>`}
let viewAll=false,category='all',page=1,search='',sortAZ=false,allCats=false;const perPage=8;
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function cats(){let m={};data.forEach(d=>m[d.cat]=(m[d.cat]||0)+1);return Object.entries(m).sort((a,b)=>b[1]-a[1]);}
function renderCats(){let cs=cats(),shown=allCats?cs:cs.slice(0,3);
 let h=`<button class="chip ${category==='all'?'active':''}" onclick="setCat('all')">${ico('grid')}Tất cả thủ tục <b>${data.length}</b></button>`+shown.map(([c,n])=>`<button class="chip ${category===c?'active':''}" onclick="setCat(${esc(JSON.stringify(c))})">${ico(catIcon[c])}${esc(label(c))} <b>${n}</b></button>`).join('');
 if(cs.length>3)h+=`<button class="chipmore" onclick="toggleCats()">${allCats?'Thu gọn':'Tất cả lĩnh vực'} ${ico('arrow',2).replace('<svg','<svg style="font-size:19px"')}</button>`;
 let box=document.getElementById('chips');box.className=allCats?'chips expanded':'chips';box.innerHTML=h;
 let sel=document.getElementById('categorySelect');sel.innerHTML='<option value="all">Lĩnh vực</option>'+cs.map(([c])=>`<option value="${esc(c)}">${esc(c)}</option>`).join('');sel.value=category;
 document.getElementById('listTitle').textContent=category==='all'?(viewAll?'Toàn bộ thủ tục':'Thủ tục phổ biến'):category;}
function toggleCats(){allCats=!allCats;renderCats();}
function goPage(n){page=n;render();document.getElementById('danh-sach').scrollIntoView({behavior:'smooth'});}
function setCat(k){category=k;page=1;renderCats();render();}
function showAll(){viewAll=!viewAll;if(viewAll){search='';document.getElementById('heroSearch').value='';category='all';sortAZ=false;document.getElementById('sortBtn').classList.remove('on');}page=1;renderCats();render();if(viewAll)document.getElementById('danh-sach').scrollIntoView({behavior:'smooth'});}
function toggleSort(){sortAZ=!sortAZ;document.getElementById('sortBtn').classList.toggle('on',sortAZ);page=1;render();}
function normalize(s){return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/g,'d')}
function getFiltered(){let a=data.filter(d=>(category==='all'||d.cat===category)&&normalize([d.name,d.cat,d.code].join(' ')).includes(normalize(search)));if(sortAZ)a.sort((x,y)=>x.name.localeCompare(y.name,'vi'));return a;}
function card(d){let desc=`Mã thủ tục: ${esc(d.code)}`;
 return `<a class="record" href="${esc(d.source)}" target="_blank" rel="noopener"><div class="ricon">${ico(catIcon[d.cat],1.5)}</div><div class="rbody"><h3><span>${esc(d.name)}</span></h3><span class="tag">${esc(d.cat)}</span><p>${desc}</p></div><span class="details">Xem thủ tục ${ico('arrow',2)}</span></a>`;}
function render(){let rows=getFiltered(),pp=viewAll?rows.length||1:perPage,size=Math.ceil(rows.length/pp),start=(page-1)*pp;let rec=document.getElementById('records');rec.classList.toggle('vertical',viewAll);document.getElementById('viewAllBtn').innerHTML=(viewAll?'Thu gọn':'Xem toàn bộ')+' '+ico('arrow',2);
 document.getElementById('records').innerHTML=rows.length?rows.slice(start,start+pp).map(card).join(''):'<div class="empty">Không tìm thấy thủ tục phù hợp. Hãy thử từ khóa hoặc lĩnh vực khác.</div>';
 document.getElementById('pager').innerHTML=size>1?pagerHtml(size):'';}
function pagerHtml(size){let set=new Set([1,size,page-1,page,page+1]);if(page<=3)[2,3,4].forEach(n=>set.add(n));if(page>=size-2)[size-1,size-2,size-3].forEach(n=>set.add(n));
 let list=[...set].filter(n=>n>=1&&n<=size).sort((x,y)=>x-y),h='',prev=0;
 if(page>1)h+=`<button onclick="goPage(${page-1})" aria-label="Trang trước">‹</button>`;
 for(const n of list){if(n-prev>1)h+='<span class="dots">…</span>';h+=`<button class="${page===n?'current':''}" onclick="goPage(${n})">${n}</button>`;prev=n;}
 if(page<size)h+=`<button onclick="goPage(${page+1})" aria-label="Trang sau">›</button>`;
 return h;}
function applyHeroSearch(){search=document.getElementById('heroSearch').value.trim();page=1;render();document.getElementById('danh-sach').scrollIntoView({behavior:'smooth'});}
function openDetail(id){let d=data.find(v=>v.id===id);if(!d)return;document.getElementById('modalTitle').textContent=d.name;document.getElementById('modalTag').innerHTML=`<span class="tag">${esc(d.cat)}</span>${d.code?` <span class="tag">Mã thủ tục: ${esc(d.code)}</span>`:''}`;document.getElementById('modalContent').innerHTML=`<div class="infogrid"><div class="info">Cơ quan giải quyết<b>${esc(d.cat)}</b></div><div class="info">Nơi tiếp nhận và trả kết quả<b>${WHERE} (không phụ thuộc địa giới hành chính)</b></div><div class="info">Mã thủ tục<b>${d.code?esc(d.code):'Theo hướng dẫn của cán bộ tiếp nhận'}</b></div><div class="info">Hình thức thực hiện<b>Trực tiếp tại phường hoặc trực tuyến qua Cổng DVC Quốc gia</b></div></div><h4>Trình tự thực hiện</h4><ol><li><b>Chuẩn bị hồ sơ:</b> tham khảo thành phần hồ sơ của thủ tục tại nguồn tra cứu bên dưới hoặc hỏi cán bộ phường trước khi đến.</li><li><b>Nộp hồ sơ:</b> đến ${WHERE} để nộp trực tiếp, hoặc nộp trực tuyến trên Cổng Dịch vụ công.</li><li><b>Tiếp nhận:</b> cán bộ kiểm tra hồ sơ, hướng dẫn bổ sung nếu còn thiếu và cấp phiếu hẹn trả kết quả.</li><li><b>Theo dõi hồ sơ:</b> tra cứu tình trạng hồ sơ bằng mã hồ sơ trên phiếu hẹn.</li><li><b>Nhận kết quả:</b> nhận kết quả tại ${WHERE} theo ngày hẹn.</li></ol><h4>Thành phần hồ sơ · Thời hạn · Phí, lệ phí</h4><p>Thực hiện theo quy định của từng thủ tục. Người dân mang theo giấy tờ tùy thân khi đến làm thủ tục; cán bộ tại phường sẽ hướng dẫn cụ thể thành phần hồ sơ, thời hạn giải quyết và mức phí, lệ phí (nếu có).</p><h4>Cách thực hiện</h4><p>Người dân có thể đến trực tiếp ${WHERE} làm thủ tục, nộp qua dịch vụ bưu chính hoặc nộp trực tuyến trên Cổng DVC Quốc gia, tùy quy định của từng thủ tục.</p>`;document.getElementById('modalWrap').classList.add('open');document.body.style.overflow='hidden';}
function closeModal(){document.getElementById('modalWrap').classList.remove('open');document.body.style.overflow='';}
document.getElementById('heroSearch').addEventListener('keydown',e=>{if(e.key==='Enter')applyHeroSearch()});document.getElementById('categorySelect').addEventListener('change',e=>setCat(e.target.value));document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});renderCats();render();

// các hàm được gọi từ thuộc tính onclick trong HTML
Object.assign(window,{applyHeroSearch,showAll,toggleSort,toggleCats,goPage,setCat,closeModal,openDetail});
