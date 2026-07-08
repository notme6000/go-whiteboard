import './style.css'
import './app.css'
import { SaveCanvas } from '../wailsjs/go/main/App'

const app = document.querySelector('#app')
app.innerHTML = `
  <div id="whiteboard">
    <div id="tab-bar">
      <div id="tab-list"></div>
      <button id="add-tab-btn" title="New Tab">+</button>
    </div>
    <div id="toolbar">
      <div class="tool-group">
        <button class="tool-btn active" data-tool="pencil" title="Pencil">✏️</button>
        <button class="tool-btn" data-tool="eraser" title="Eraser">🧹</button>
        <button class="tool-btn" data-tool="line" title="Line">╱</button>
        <button class="tool-btn" data-tool="rectangle" title="Rectangle">▭</button>
        <button class="tool-btn" data-tool="circle" title="Circle">○</button>
      </div>
      <div class="tool-group" id="color-group">
        <input type="color" id="color-picker" value="#000000" title="Custom Color">
        <div id="preset-colors">
          <button class="color-btn" style="background:#000" data-color="#000000"></button>
          <button class="color-btn" style="background:#f44336" data-color="#f44336"></button>
          <button class="color-btn" style="background:#e91e63" data-color="#e91e63"></button>
          <button class="color-btn" style="background:#9c27b0" data-color="#9c27b0"></button>
          <button class="color-btn" style="background:#3f51b5" data-color="#3f51b5"></button>
          <button class="color-btn" style="background:#2196f3" data-color="#2196f3"></button>
          <button class="color-btn" style="background:#009688" data-color="#009688"></button>
          <button class="color-btn" style="background:#4caf50" data-color="#4caf50"></button>
          <button class="color-btn" style="background:#ff9800" data-color="#ff9800"></button>
          <button class="color-btn" style="background:#795548" data-color="#795548"></button>
          <button class="color-btn" style="background:#9e9e9e" data-color="#9e9e9e"></button>
          <button class="color-btn" style="background:#fff" data-color="#ffffff"></button>
        </div>
      </div>
      <div class="tool-group" id="size-group">
        <label title="Stroke Size">●</label>
        <input type="range" id="size-slider" min="1" max="30" value="3">
        <span id="size-label">3</span>
      </div>
      <div class="tool-group" id="action-group">
        <button id="undo-btn" title="Undo">↩</button>
        <button id="clear-btn" title="Clear All">🗑</button>
        <button id="save-btn" title="Save as PNG">💾</button>
      </div>
    </div>
    <div id="canvas-container">
      <canvas id="main-canvas"></canvas>
      <canvas id="overlay-canvas"></canvas>
    </div>
  </div>
`

const canvas = document.getElementById('main-canvas')
const overlay = document.getElementById('overlay-canvas')
const ctx = canvas.getContext('2d')
const octx = overlay.getContext('2d')

let tabs = [{ id: 0, name: 'Tab 1', strokes: [] }]
let activeTabId = 0
let nextTabId = 1

let currentTool = 'pencil'
let currentColor = '#000000'
let currentSize = 3
let isDrawing = false
let currentStroke = null

function resizeCanvas() {
  const container = document.getElementById('canvas-container')
  canvas.width = container.clientWidth
  canvas.height = container.clientHeight
  overlay.width = container.clientWidth
  overlay.height = container.clientHeight
  render()
}

function getStrokeData(tabId) {
  const tab = tabs.find(t => t.id === tabId)
  return tab ? tab.strokes : []
}

function saveStrokeData(tabId, strokes) {
  const tab = tabs.find(t => t.id === tabId)
  if (tab) tab.strokes = strokes
}

function getActiveStrokes() {
  return getStrokeData(activeTabId)
}

function setActiveStrokes(strokes) {
  saveStrokeData(activeTabId, strokes)
}

function render() {
  const w = canvas.width, h = canvas.height
  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, w, h)

  const strokes = getActiveStrokes()
  for (const s of strokes) drawStroke(ctx, s)
  if (currentStroke) drawStroke(ctx, currentStroke)
}

function drawStroke(context, s) {
  context.save()
  context.lineCap = 'round'
  context.lineJoin = 'round'

  if (s.tool === 'eraser') {
    context.strokeStyle = '#ffffff'
    context.lineWidth = s.size
    if (s.points && s.points.length > 1) {
      context.beginPath()
      context.moveTo(s.points[0].x, s.points[0].y)
      for (let i = 1; i < s.points.length; i++) {
        context.lineTo(s.points[i].x, s.points[i].y)
      }
      context.stroke()
    }
  } else if (s.tool === 'pencil') {
    context.strokeStyle = s.color
    context.lineWidth = s.size
    if (s.points && s.points.length > 1) {
      context.beginPath()
      context.moveTo(s.points[0].x, s.points[0].y)
      for (let i = 1; i < s.points.length; i++) {
        context.lineTo(s.points[i].x, s.points[i].y)
      }
      context.stroke()
    }
  } else if (s.tool === 'line') {
    context.strokeStyle = s.color
    context.lineWidth = s.size
    context.beginPath()
    context.moveTo(s.startX, s.startY)
    context.lineTo(s.endX, s.endY)
    context.stroke()
  } else if (s.tool === 'rectangle') {
    context.strokeStyle = s.color
    context.lineWidth = s.size
    const x = Math.min(s.startX, s.endX)
    const y = Math.min(s.startY, s.endY)
    const w = Math.abs(s.endX - s.startX)
    const h = Math.abs(s.endY - s.startY)
    if (s.fill) {
      context.fillStyle = s.fill
      context.fillRect(x, y, w, h)
    }
    context.strokeRect(x, y, w, h)
  } else if (s.tool === 'circle') {
    context.strokeStyle = s.color
    context.lineWidth = s.size
    const cx = (s.startX + s.endX) / 2
    const cy = (s.startY + s.endY) / 2
    const rx = Math.abs(s.endX - s.startX) / 2
    const ry = Math.abs(s.endY - s.startY) / 2
    context.beginPath()
    context.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
    if (s.fill) {
      context.fillStyle = s.fill
      context.fill()
    }
    context.stroke()
  }

  context.restore()
}

function getPos(e) {
  const rect = canvas.getBoundingClientRect()
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY
  return { x: clientX - rect.left, y: clientY - rect.top }
}

function startDrawing(e) {
  e.preventDefault()
  const pos = getPos(e)
  isDrawing = true

  if (currentTool === 'pencil' || currentTool === 'eraser') {
    currentStroke = {
      tool: currentTool,
      color: currentTool === 'eraser' ? null : currentColor,
      size: currentTool === 'eraser' ? currentSize * 3 : currentSize,
      points: [pos]
    }
  } else {
    currentStroke = {
      tool: currentTool,
      color: currentColor,
      size: currentSize,
      startX: pos.x,
      startY: pos.y,
      endX: pos.x,
      endY: pos.y,
      fill: null
    }
  }
}

function draw(e) {
  e.preventDefault()
  if (!isDrawing || !currentStroke) return
  const pos = getPos(e)

  if (currentStroke.tool === 'pencil' || currentStroke.tool === 'eraser') {
    const last = currentStroke.points[currentStroke.points.length - 1]
    const w = canvas.width, h = canvas.height
    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, w, h)
    const strokes = getActiveStrokes()
    for (const s of strokes) drawStroke(ctx, s)

    currentStroke.points.push(pos)
    drawStroke(ctx, currentStroke)
  } else {
    currentStroke.endX = pos.x
    currentStroke.endY = pos.y
    const w = canvas.width, h = canvas.height
    octx.clearRect(0, 0, w, h)
    drawStroke(octx, currentStroke)
  }
}

function stopDrawing(e) {
  e.preventDefault()
  if (!isDrawing || !currentStroke) return
  isDrawing = false

  const strokes = getActiveStrokes()
  strokes.push(currentStroke)
  setActiveStrokes(strokes)
  currentStroke = null
  octx.clearRect(0, 0, overlay.width, overlay.height)
  render()
}

canvas.addEventListener('mousedown', startDrawing)
canvas.addEventListener('mousemove', draw)
canvas.addEventListener('mouseup', stopDrawing)
canvas.addEventListener('mouseleave', stopDrawing)
canvas.addEventListener('touchstart', startDrawing, { passive: false })
canvas.addEventListener('touchmove', draw, { passive: false })
canvas.addEventListener('touchend', stopDrawing, { passive: false })

document.querySelectorAll('.tool-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    currentTool = btn.dataset.tool
    canvas.style.cursor = currentTool === 'eraser' ? 'cell' : 'crosshair'
  })
})

document.querySelectorAll('.color-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentColor = btn.dataset.color
    document.getElementById('color-picker').value = currentColor
    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active-color'))
    btn.classList.add('active-color')
  })
})

document.getElementById('color-picker').addEventListener('input', (e) => {
  currentColor = e.target.value
  document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active-color'))
})

document.getElementById('size-slider').addEventListener('input', (e) => {
  currentSize = parseInt(e.target.value)
  document.getElementById('size-label').textContent = currentSize
})

document.getElementById('undo-btn').addEventListener('click', () => {
  const strokes = getActiveStrokes()
  if (strokes.length > 0) {
    strokes.pop()
    setActiveStrokes(strokes)
    render()
  }
})

document.getElementById('clear-btn').addEventListener('click', () => {
  setActiveStrokes([])
  render()
})

document.getElementById('save-btn').addEventListener('click', () => {
  const dataURL = canvas.toDataURL('image/png')
  SaveCanvas(dataURL).catch(err => console.error('Save failed:', err))
})

function renderTabBar() {
  const tabList = document.getElementById('tab-list')
  tabList.innerHTML = ''
  tabs.forEach(tab => {
    const tabEl = document.createElement('div')
    tabEl.className = 'tab' + (tab.id === activeTabId ? ' active' : '')
    const span = document.createElement('span')
    span.textContent = tab.name
    span.addEventListener('click', () => switchTab(tab.id))
    tabEl.appendChild(span)
    if (tabs.length > 1) {
      const closeBtn = document.createElement('button')
      closeBtn.className = 'tab-close'
      closeBtn.textContent = '×'
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        closeTab(tab.id)
      })
      tabEl.appendChild(closeBtn)
    }
    tabList.appendChild(tabEl)
  })
}

function switchTab(id) {
  if (id === activeTabId) return
  currentStroke = null
  octx.clearRect(0, 0, overlay.width, overlay.height)
  activeTabId = id
  renderTabBar()
  render()
}

function closeTab(id) {
  if (tabs.length <= 1) return
  const idx = tabs.findIndex(t => t.id === id)
  tabs = tabs.filter(t => t.id !== id)
  if (activeTabId === id) {
    const newIdx = Math.min(idx, tabs.length - 1)
    activeTabId = tabs[newIdx].id
  }
  renderTabBar()
  render()
}

document.getElementById('add-tab-btn').addEventListener('click', () => {
  const id = nextTabId++
  tabs.push({ id, name: `Tab ${id + 1}`, strokes: [] })
  switchTab(id)
})

function fitStrokeToCanvas(s) {
  if (s.tool === 'pencil' || s.tool === 'eraser') {
    if (s.points) {
      s.points = s.points.filter(p => p.x >= 0 && p.y >= 0 && p.x <= canvas.width && p.y <= canvas.height)
    }
  } else {
    s.startX = Math.max(0, Math.min(canvas.width, s.startX))
    s.startY = Math.max(0, Math.min(canvas.height, s.startY))
    s.endX = Math.max(0, Math.min(canvas.width, s.endX))
    s.endY = Math.max(0, Math.min(canvas.height, s.endY))
  }
}

renderTabBar()

window.addEventListener('resize', resizeCanvas)
resizeCanvas()
