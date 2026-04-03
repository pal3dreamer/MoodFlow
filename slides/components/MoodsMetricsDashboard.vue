<template>
  <div class="sentiment-dashboard w-full h-full flex flex-col overflow-hidden text-black relative">
    <div class="flex-grow flex flex-row w-full relative h-full min-h-0">
      <!-- Left Column: 3D Scene -->
      <div class="scene-column flex-grow h-full flex justify-center items-center relative pr-4" style="width: 55%;">
        <div id="scene" ref="sceneRef" class="w-full h-full min-h-[300px]"></div>
      </div>

      <!-- Right Column: Charts (3x1 flex col) -->
      <div class="charts-column flex-shrink-0 flex flex-col justify-between gap-y-4 h-full pb-4 pr-4" style="width: 45%;">
        <!-- Stress Chart -->
        <div class="chart-container w-full flex-grow relative"><canvas ref="stressRef"></canvas></div>
        <!-- Valence Chart -->
        <div class="chart-container w-full flex-grow relative"><canvas ref="valenceRef"></canvas></div>
        <!-- Dominance Chart -->
        <div class="chart-container w-full flex-grow relative"><canvas ref="dominanceRef"></canvas></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Chart from 'chart.js/auto'

const sceneRef = ref(null)
const stressRef = ref(null)
const valenceRef = ref(null)
const dominanceRef = ref(null)

let animationId = null
let charts = []
let renderer = null
let controls = null
let resizeObserver = null
let camera = null

// Helper: create a high-DPI canvas texture with crisp text
function createHiDpiCanvasTexture(drawFn, width, height) {
  const scaleFactor = 8 
  const canvas = document.createElement('canvas')
  canvas.width = width * scaleFactor
  canvas.height = height * scaleFactor
  const ctx = canvas.getContext('2d')
  
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  
  drawFn(ctx, canvas.width, canvas.height, scaleFactor)
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.LinearMipMapLinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.anisotropy = 16
  texture.colorSpace = THREE.SRGBColorSpace
  texture.generateMipmaps = true
  texture.needsUpdate = true
  return texture
}

onMounted(() => {
  // --- Data Generation (Exact match to image) ---
  const tArr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  // 3D vertical (Y-axis) -> arbitrarily matched to make a nice loop
  const aArr = [0.10, 0.40, 0.60, 0.30, 0.60, 0.40, 0.20, 0.50, 0.85, 0.90]
  // Charts
  const sArr = [0.98, 0.34, 0.68, 0.34, 0.36, 0.18, 0.10, 0.24, 0.98, 1.20] 
  const vArr = [0.30, 0.38, 0.30, 0.50, 0.70, 0.35, 0.20, 0.24, 0.18, 0.20]
  const dArr = [0.98, 0.50, 0.68, 0.50, 0.50, 0.35, 0.20, 0.50, 0.88, 0.85]

  // --- Three.js Scene Setup ---
  const container = sceneRef.value
  const scene = new THREE.Scene()

  const initialWidth = container.clientWidth || 400
  const initialHeight = container.clientHeight || 400

  camera = new THREE.PerspectiveCamera(50, initialWidth / initialHeight, 0.1, 100)
  camera.position.set(2.0, 0.8, 2.8)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(initialWidth, initialHeight)
  renderer.setPixelRatio(window.devicePixelRatio || 2) // Enforce high res rendering
  container.appendChild(renderer.domElement)

  resizeObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
      const { width, height } = entry.contentRect
      if (width > 0 && height > 0) {
        camera.aspect = width / height
        camera.updateProjectionMatrix()
        renderer.setSize(width, height)
      }
    }
  })
  resizeObserver.observe(container)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05

  scene.add(new THREE.DirectionalLight(0xffffff, 1).position.set(3, 3, 3))
  const dirLight = new THREE.DirectionalLight(0xffffff, 1)
  dirLight.position.set(3, 3, 3)
  scene.add(dirLight)
  scene.add(new THREE.AmbientLight(0xffffff, 0.6))

  const vadGroup = new THREE.Group()
  // Static isometric rotation matching image (slightly from left)
  vadGroup.rotation.set(0.1, -0.8, 0)
  scene.add(vadGroup)

  // Wireframe cube
  const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1))
  vadGroup.add(new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xcccccc })))

  // Emotion labels
  const emotionMap = {
    Angry: [-0.5, 0.5, 0.5], Distressed: [-0.5, 0.5, 0], Anxious: [-0.5, 0.5, -0.5],
    Sad: [-0.5, -0.5, -0.5], Dejected: [-0.5, -0.5, 0], Bored: [-0.5, -0.5, 0.5],
    Calm: [0.5, -0.5, 0], Relaxed: [0.5, -0.5, 0.5], Satisfied: [0.5, 0, 0.5],
    Relieved: [0.5, 0, 0], Optimistic: [0.5, 0, -0.5], Excited: [0.5, 0.5, 0.5],
    Elated: [0.5, 0.5, 0], Surprised: [0, 0.5, 0], Alerted: [-0.5, 0, 0.5],
    Fatigued: [0.5, -0.5, 0], Pessimistic: [-0.5, 0, -0.5], 'Over-confident': [0.5, -0.5, 0.5]
  }

  function addLabel(text, ev, ea, ed) {
    const texture = createHiDpiCanvasTexture((ctx, w, h, scale) => {
      ctx.fillStyle = '#444444'
      ctx.font = `bold ${14 * scale}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(text, w / 2, h / 2)
    }, 140, 40)

    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }))
    sprite.scale.set(0.45, 0.13, 1)
    const offset = 0.08
    sprite.position.set(
      ev + Math.sign(ev || 1) * offset,
      ea + Math.sign(ea || 1) * offset,
      ed + Math.sign(ed || 1) * offset
    )
    vadGroup.add(sprite)
  }

  for (const e in emotionMap) {
    const [ev, ea, ed] = emotionMap[e]
    addLabel(e, ev, ea, ed)
  }

  // Trajectory curve (smooth)
  const pathPoints = []
  tArr.forEach((time, idx) => {
    pathPoints.push(new THREE.Vector3(vArr[idx] - 0.5, aArr[idx] - 0.5, dArr[idx] - 0.5))
  })
  
  const curve = new THREE.CatmullRomCurve3(pathPoints)
  const curvePoints = curve.getPoints(100)
  
  const colors = []
  curvePoints.forEach((pt, i) => {
    const color = new THREE.Color()
    color.setHSL((1 - i / (curvePoints.length - 1)) * 0.7, 1, 0.5)
    colors.push(color.r, color.g, color.b)
  })

  const lineGeo = new THREE.BufferGeometry()
  lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(curvePoints.map(p => [p.x, p.y, p.z]).flat(), 3))
  lineGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  vadGroup.add(new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ vertexColors: true, linewidth: 4 })))
  
  // Add dots matching chart points
  const pointPositions = [], pointColors = []
  tArr.forEach((time, idx) => {
    pointPositions.push(vArr[idx] - 0.5, aArr[idx] - 0.5, dArr[idx] - 0.5)
    const color = new THREE.Color()
    color.setHSL((1 - time / tArr[tArr.length - 1]) * 0.7, 1, 0.5)
    pointColors.push(color.r, color.g, color.b)
  })
  
  const pointsGeo = new THREE.BufferGeometry()
  pointsGeo.setAttribute('position', new THREE.Float32BufferAttribute(pointPositions, 3))
  pointsGeo.setAttribute('color', new THREE.Float32BufferAttribute(pointColors, 3))
  vadGroup.add(new THREE.Points(pointsGeo, new THREE.PointsMaterial({ size: 0.08, vertexColors: true })))

  // Timeline legend — crisp hi-dpi
  function createTimeline() {
    const W = 80, H = 280
    const texture = createHiDpiCanvasTexture((ctx, w, h, scale) => {
      const gradient = ctx.createLinearGradient(0, 30 * scale, 0, h - 30 * scale)
      gradient.addColorStop(0, 'blue')
      gradient.addColorStop(0.25, 'cyan')
      gradient.addColorStop(0.5, 'green')
      gradient.addColorStop(0.75, 'yellow')
      gradient.addColorStop(1, 'red')
      ctx.fillStyle = gradient
      ctx.fillRect(10 * scale, 30 * scale, 14 * scale, h - 60 * scale)

      ctx.fillStyle = '#333'
      ctx.font = `bold ${12 * scale}px Arial`
      ctx.textAlign = 'left'
      ctx.fillText('t=1', 28 * scale, 36 * scale)
      ctx.fillText('t=0', 28 * scale, h - 32 * scale)
    }, W, H)

    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.28, 0.85),
      new THREE.MeshBasicMaterial({ map: texture, transparent: true })
    )
    mesh.position.set(0.9, 0, 0)
    vadGroup.add(mesh)
  }
  createTimeline()

  // Animation
  let time = 0
  function animate() {
    animationId = requestAnimationFrame(animate)
    time += 0.005
    // Add continuous gentle rotation just like the previous slide
    vadGroup.rotation.y += 0.002
    // very subtle vertical float
    vadGroup.position.y = Math.sin(time * 5) * 0.02
    controls.update()
    renderer.render(scene, camera)
  }
  animate()

  // --- Chart.js ---
  Chart.defaults.font.family = "'Inter', 'Helvetica Neue', sans-serif"
  Chart.defaults.font.size = 8
  Chart.defaults.color = '#999'

  function makeChart(canvasRef, data, color, yAxisLabel) {
    if (!canvasRef) return null
    return new Chart(canvasRef, {
      type: 'line',
      data: {
        labels: tArr,
        datasets: [{
          data,
          borderColor: color,
          backgroundColor: color, // fill dots
          borderWidth: 2,
          fill: false,
          tension: 0.4, // EXACTLY match smooth curves from image
          pointRadius: 2.5,
          pointBackgroundColor: color,
          pointHoverRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        devicePixelRatio: 3, // Enforce 4K crispness on chart canvas
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false }
        },
        scales: {
          x: {
            title: { display: true, text: 'Time (s)', font: { size: 8, weight: 'bold' }, color: '#666' },
            ticks: {
              callback: (val, index) => tArr[index] % 1 === 0 ? tArr[index] : '',
              maxRotation: 0,
              autoSkip: false
            },
            grid: { display: false } // match: no vertical lines
          },
          y: {
            min: 0,
            max: 1.0,
            title: { display: true, text: yAxisLabel, font: { size: 8, weight: 'bold' }, color: '#666' },
            grid: { display: true, color: 'rgba(0,0,0,0.08)' },
            ticks: { stepSize: 0.1, font: { size: 8 } } // matching 0, 0.1...1.0
          }
        }
      }
    })
  }

  charts.push(makeChart(stressRef.value,    sArr, '#8b52a1', 'Stress Level'))
  charts.push(makeChart(valenceRef.value,   vArr, '#d14b43', 'Valence Level'))
  charts.push(makeChart(dominanceRef.value, dArr, '#54a854', 'Dominance Level'))
})

onBeforeUnmount(() => {
  if (animationId) cancelAnimationFrame(animationId)
  charts.forEach(c => c && c.destroy())
  if (resizeObserver && sceneRef.value) resizeObserver.unobserve(sceneRef.value)
  if (renderer) { renderer.dispose(); renderer.domElement.remove() }
})
</script>

<style scoped>
.chart-container {
  position: relative;
  /* forces Chart.js to respect flex parent boundaries instead of infinitely growing */
  flex: 1 1 0;
  min-height: 0;
  overflow: hidden;
}
</style>
