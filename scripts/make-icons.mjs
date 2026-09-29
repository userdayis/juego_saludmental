import sharp from 'sharp'
import { writeFileSync } from 'node:fs'

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#2f9e76"/>
  <circle cx="256" cy="256" r="176" fill="#e8f6ef"/>
  <path d="M256 120c-40 48-72 88-72 136a72 72 0 0 0 144 0c0-48-32-88-72-136z" fill="#1d6b52"/>
  <path d="M256 176v184" stroke="#e8f6ef" stroke-width="14" stroke-linecap="round"/>
  <path d="M256 240c-24-8-44-6-60 6M256 300c24-8 44-6 60 6" stroke="#e8f6ef" stroke-width="14" stroke-linecap="round" fill="none"/>
</svg>`

const buffer = Buffer.from(svg)

await sharp(buffer).resize(192, 192).png().toFile('public/icon-192.png')
await sharp(buffer).resize(512, 512).png().toFile('public/icon-512.png')
writeFileSync('public/favicon.svg', svg)
console.log('iconos generados: icon-192.png, icon-512.png, favicon.svg')
