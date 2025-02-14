import readline from 'node:readline'

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const screen = [], field = []
// const chars = { empty: ' ', covered: '#', mine: '*', flag: 'X' }
const chars = { empty: esc(' ', 100), covered: esc('#', 97), mine: esc('*', 91), flag: esc('X', 91) }
const size = { height: 10, width: 10, mines: 10 }
let flags = 0
let mines = 0
let output = ''

function esc(text, code) {
  // surround with ansi escape code
  return `[${code}m${text}[0m`
}

function isValid(x, y) {
  return field[x] !== undefined && field[x][y] !== undefined
}

function generate() {
  for (let i = 0; i < size.width; i++) {
    screen[i] = []
    field[i] = []
    for (let j = 0; j < size.height; j++) {
      screen[i][j] = chars.covered
      field[i][j] = 0
    }
  }
  for (let i = 0; i < size.mines; i++) placeMine()
}

function placeMine() {
  const x = Math.round(Math.random() * size.width)
  const y = Math.round(Math.random() * size.height)
  if (isValid(x, y) && field[x][y] !== chars.mine) {
    field[x][y] = chars.mine
    mines++
    for (let i = x - 1; i <= x + 1; i++) for (let j = y - 1; j <= y + 1; j++) {
      if (isValid(i, j) && field[i][j] !== chars.mine) field[i][j]++
    }
  } else return placeMine()
}

function printField(field) {
  let line = ''
  console.log(`     ${mines} mines | ${flags} flags | (> XY) (> fXY)`)
  console.log('')
  for (let i = 0; i < size.width; i++) line += ` ${i}`
  console.log(`    ${line}`)
  console.log(`   ┌${'──'.repeat(size.width)}─┐`)
  for (let i = 0; i < size.height; i++) {
    line = ''
    field.forEach(col => { line += ` ${col[i]}` })
    console.log(` ${i} │${line} │`)
  }
  console.log(`   └${'──'.repeat(size.width)}─┘`)
  console.log(output)
}

function clearTile(x, y) {
  if (!isValid(x, y)) return false
  if (screen[x][y] !== chars.covered && screen[x][y] !== chars.empty) return false
  if (field[x][y] === chars.mine) {
    revealMines()
    output = 'Boom!'
    return true
  }
  if (field[x][y] !== 0) {
    screen[x][y] = field[x][y]
    return false
  }
  for (let i = x - 1; i <= x + 1; i++) {
    for (let j = y - 1; j <= y + 1; j++) {
      if (isValid(i, j) && screen[i][j] === chars.covered) {
        if (field[i][j] === 0) {
          screen[i][j] = chars.empty
          clearTile(i, j)
        } else if (field[i][j] === chars.mine) {
          // do nothing
        } else screen[i][j] = field[i][j]
      }
    }
  }
  return false
}

function revealMines() {
  for (let x = 0; x < size.width; x++) {
    for (let y = 0; y < size.height; y++) {
      if (field[x][y] === chars.mine) {
        screen[x][y] = chars.mine
      }
    }
  }
}

function flag(x, y) {
  if (!isValid(x, y)) return false
  if (screen[x][y] === chars.covered) {
    screen[x][y] = chars.flag
    flags++
  } else if (screen[x][y] === chars.flag) {
    screen[x][y] = chars.covered
    flags--
  }
  return checkFlags()
}

function checkFlags() {
  if (flags !== size.mines) return false
  let accuracy = 0
  for (let x = 0; x < size.width; x++) {
    for (let y = 0; y < size.height; y++) {
      if (screen[x][y] === chars.flag && field[x][y] === chars.mine) {
        accuracy++
      }
    }
  }
  if (accuracy === size.mines) {
    output = 'All mines found!'
    return true
  } else return false
}

function run(exit) {
  console.clear()
  output === 'cheat'
    ? printField(field)
    : printField(screen)
  if (exit) {
    rl.close()
    return
  }
  rl.question('> ', input => {
    if (input.length === 2) {
      let x = input[0] * 1
      let y = input[1] * 1
      return run(clearTile(x, y))
    } else if (input.length === 3 && input[0].toLowerCase() === "f") {
      let x = input[1] * 1
      let y = input[2] * 1
      return run(flag(x, y))
    } else if (input === 'cheat') {
      output = (output === 'cheat' ? '' : 'cheat')
      return run(false)
    } else if (input === 'check') {
      return run(checkFlags())
    } else return run(input === 'exit')
  })
}

generate()
run(false)
