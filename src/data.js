// Dữ liệu thủ tục: lấy từ src/rows.js (bản gốc). Nếu trang quản trị đã lưu bản chỉnh sửa
// trong trình duyệt (localStorage) thì dùng bản đó.
// Mỗi dòng: [tên thủ tục, lĩnh vực, mã TTHC, đường link, nhóm ('tthc' | 'phidiagioi'), cơ quan, (tùy chọn) {big, by, desc, content, kw, feat, status, upd}]
import { rows as baseRows } from './rows.js';

export const STORE_KEY='tthc_rows_v1';
let rows=baseRows;
try{const s=JSON.parse(localStorage.getItem(STORE_KEY)||'null');if(Array.isArray(s)&&s.length)rows=s}catch(e){}

const full=rows.map(d=>{const x=d[6]||{};return{name:d[0],cat:d[1],code:d[2],source:d[3],group:d[4],org:d[5],
  big:x.big||'',by:x.by||'',desc:x.desc||'',content:x.content||'',kw:x.kw||[],feat:!!x.feat,status:x.status||'pub',upd:x.upd||''}});

// Toàn bộ thủ tục (kể cả bản nháp / đã ẩn) dùng cho trang quản trị
export const allData=full.map((d,i)=>({id:i+1,...d}));
// Chỉ thủ tục đã xuất bản được hiện ở trang tra cứu
export const data=full.filter(d=>d.status==='pub').map((d,i)=>({id:i+1,...d}));

// Danh mục (lĩnh vực) tự suy ra từ các thủ tục
export const categories=[...new Map(data.map(d=>[d.group+'|'+d.cat,{group:d.group,name:d.cat,org:d.org}])).values()];
