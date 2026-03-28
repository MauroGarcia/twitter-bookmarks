// Script simples para criar um ícone ICO placeholder
// Para produção, substitua por um design real
import fs from 'fs'
import path from 'path'

// Criar um PNG simples 1x1 para placeholder (pode ser convertido para ICO)
const pngHeader = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
const ihdr = Buffer.from([0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0, 0, 0, 1, 8, 2, 0, 0, 0, 144, 119, 83, 222])
const idat = Buffer.from([0, 0, 0, 12, 73, 68, 65, 84, 8, 153, 99, 248, 15, 0, 0, 1, 1, 0, 5, 186, 33, 213, 77])
const iend = Buffer.from([0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130])

const png = Buffer.concat([pngHeader, ihdr, idat, iend])
fs.writeFileSync(path.join('resources', 'icon.png'), png)

console.log('✓ Ícone placeholder criado em resources/icon.png')
