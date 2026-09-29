const fs = require('fs')
const path = require('path')

function walk(d) {
  return fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(d, e.name)
    if (e.isDirectory()) return walk(p)
    return /\.(tsx|ts)$/.test(e.name) && !p.includes('i18n') ? [p] : []
  })
}

function dictKeys(file) {
  const s = fs.readFileSync(file, 'utf8')
  const keys = new Set()
  for (const m of s.matchAll(/^\s*'([^']+)':/gm)) keys.add(m[1])
  return keys
}

const files = walk('src')
const used = new Set()
for (const f of files) {
  const s = fs.readFileSync(f, 'utf8')
  for (const m of s.matchAll(/\bt\(\s*'([^']+)'/g)) used.add(m[1])
}

const es = dictKeys('src/i18n/es.ts')
const en = dictKeys('src/i18n/en.ts')

const missingEs = [...used].filter((k) => !es.has(k)).sort()
const missingEn = [...es].filter((k) => !en.has(k)).sort()
const extraEn = [...en].filter((k) => !es.has(k)).sort()

console.log('usadas:', used.size, '| es:', es.size, '| en:', en.size)
console.log('FALTAN en es:', JSON.stringify(missingEs))
console.log('FALTAN en en:', JSON.stringify(missingEn))
console.log('SOBRAN en en:', JSON.stringify(extraEn))
