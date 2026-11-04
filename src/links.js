// Đọc file links-bo-sung.csv (Mã TTHC, Tên thủ tục, Cơ quan, Đường link)
// và ghi đè đường link cho các thủ tục có điền link.
export function applyExtraLinks(data, csvText) {
  const text = csvText.replace(/^﻿/, '')
  const firstLine = text.split(/\r?\n/)[0] || ''
  const sep = [',', ';', '\t'].sort((a, b) => firstLine.split(b).length - firstLine.split(a).length)[0]

  const rows = []
  let row = [], cell = '', quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++ }
      else if (c === '"') quoted = false
      else cell += c
    } else if (c === '"') quoted = true
    else if (c === sep) { row.push(cell); cell = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(cell); rows.push(row); row = []; cell = ''
    } else cell += c
  }
  if (cell || row.length) { row.push(cell); rows.push(row) }

  const links = new Map()
  for (const r of rows.slice(1)) {
    const code = (r[0] || '').trim()
    const url = (r[3] || '').trim()
    if (code && /^https?:\/\//i.test(url)) links.set(code, url)
  }
  for (const d of data) if (links.has(d.code)) d.source = links.get(d.code)
  return data
}
