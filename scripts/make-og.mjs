import { mkdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..')
const outDir = path.join(root, 'public')
const outFile = path.join(outDir, 'og.png')

try {
  const { default: sharp } = await import('sharp')
  const svg = await readFile(path.join(here, 'og.svg'))
  await mkdir(outDir, { recursive: true })
  await sharp(svg, { density: 96 }).resize(1200, 630).png({ quality: 90 }).toFile(outFile)
  console.log('og.png generado en public/og.png')
} catch (error) {
  console.warn('No se pudo generar og.png (se omite la imagen Open Graph):', error.message)
  process.exitCode = 0
}
