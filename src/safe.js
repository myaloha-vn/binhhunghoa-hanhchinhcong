// Làm sạch HTML do người soạn nhập: chỉ giữ các thẻ định dạng cơ bản, bỏ script và thuộc tính nguy hiểm
const OK=new Set(['P','BR','B','STRONG','I','EM','U','S','STRIKE','H2','H3','H4','UL','OL','LI','BLOCKQUOTE','A','HR','SPAN','DIV','SUB','SUP','TABLE','THEAD','TBODY','TR','TD','TH']);
const DROP=new Set(['SCRIPT','STYLE','IFRAME','OBJECT','EMBED','NOSCRIPT','TEMPLATE','LINK','META','FORM','INPUT','BUTTON']);
export function sanitize(html){
  const doc=new DOMParser().parseFromString('<body>'+String(html||'')+'</body>','text/html');
  const walk=n=>{for(const c of [...n.childNodes]){
    if(c.nodeType===3)continue;
    if(c.nodeType!==1){c.remove();continue}
    if(DROP.has(c.tagName)){c.remove();continue}
    if(!OK.has(c.tagName)){walk(c);c.replaceWith(...c.childNodes);continue}
    for(const a of [...c.attributes]){
      const k=a.name.toLowerCase(),v=a.value.trim();
      if(c.tagName==='A'&&k==='href'&&/^(https?:|mailto:)/i.test(v))continue;
      if(k==='style'&&/^text-align:\s*(left|center|right|justify);?$/i.test(v))continue;
      c.removeAttribute(a.name);
    }
    if(c.tagName==='A'){c.setAttribute('target','_blank');c.setAttribute('rel','noopener')}
    walk(c);
  }};
  walk(doc.body);return doc.body.innerHTML;
}
