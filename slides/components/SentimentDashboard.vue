<template>
  <div class="sentiment-dashboard w-full h-full flex flex-row overflow-hidden text-black pt-1 pb-1">
    <!-- Left Column: Charts (2x2 grid) -->
    <div class="charts-column flex-shrink-0 grid grid-cols-2 grid-rows-2 gap-x-4 gap-y-2 h-full" style="width: 55%;">

      <!-- Arousal Chart -->
      <div class="chart-box flex flex-col justify-start items-center h-full">
        <h5 class="chart-title">Arousal over Time</h5>
        <p class="chart-subtitle">The intensity of emotional activation, ranging from calm to excited</p>
        <div class="chart-container w-full flex-grow mt-1"><canvas ref="arousalRef"></canvas></div>
      </div>

      <!-- Dominance Chart -->
      <div class="chart-box flex flex-col justify-start items-center h-full">
        <h5 class="chart-title">Dominance over Time</h5>
        <p class="chart-subtitle">The level of control or influence expressed in speech</p>
        <div class="chart-container w-full flex-grow mt-1"><canvas ref="dominanceRef"></canvas></div>
      </div>

      <!-- Valence Chart -->
      <div class="chart-box flex flex-col justify-start items-center h-full">
        <h5 class="chart-title">Valence over Time</h5>
        <p class="chart-subtitle">The degree of pleasantness or positivity in emotional expression</p>
        <div class="chart-container w-full flex-grow mt-1"><canvas ref="valenceRef"></canvas></div>
      </div>

      <!-- Stress Chart -->
      <div class="chart-box flex flex-col justify-start items-center h-full">
        <h5 class="chart-title">Stress over Time</h5>
        <p class="chart-subtitle">A measure of tension and pressure experienced during speech</p>
        <div class="chart-container w-full flex-grow mt-1"><canvas ref="stressRef"></canvas></div>
      </div>

    </div>

    <!-- Right Column: 3D Scene -->
    <div class="scene-column flex-grow h-full flex justify-center items-center relative pl-4" style="width: 45%;">
      <div id="scene" ref="sceneRef" class="w-full h-full min-h-[300px]"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Chart from 'chart.js/auto'

const sceneRef = ref(null)
const arousalRef = ref(null)
const dominanceRef = ref(null)
const valenceRef = ref(null)
const stressRef = ref(null)

let animationId = null
let charts = []
let renderer = null
let controls = null
let resizeObserver = null
let camera = null

// Helper: create a high-DPI canvas texture with crisp text
function createHiDpiCanvasTexture(drawFn, width, height) {
  // Use a much higher scale factor to ensure the internal canvas is huge
  // This drastically improves crispness when scaled down in WebGL
  const scaleFactor = 8 
  const canvas = document.createElement('canvas')
  canvas.width = width * scaleFactor
  canvas.height = height * scaleFactor
  const ctx = canvas.getContext('2d')
  
  // Notice we DO NOT use ctx.scale() here. We want drawFn to explicitly use large font sizes.
  // Enforce high quality drawing
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  
  drawFn(ctx, canvas.width, canvas.height, scaleFactor)
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.LinearMipMapLinearFilter // Mipmapping fixes distance aliasing
  texture.magFilter = THREE.LinearFilter
  texture.anisotropy = 16 // Fixes blur at oblique angles
  texture.colorSpace = THREE.SRGBColorSpace // Correct color blending
  texture.generateMipmaps = true
  texture.needsUpdate = true
  return texture
}

onMounted(() => {
  // --- Data Generation (Exact match to image) ---
  const tArr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  const aArr = [0.42, 0.40, 0.28, 0.45, 0.42, 0.52, 0.62, 0.64, 0.75, 0.65]
  const dArr = [0.40, 0.42, 0.40, 0.50, 0.48, 0.50, 0.62, 0.65, 0.74, 0.70]
  const vArr = [0.40, 0.60, 0.32, 0.55, 0.10, 0.40, 0.55, 0.60, 0.70, 0.85]
  const sArr = [0.20, 0.15, 0.10, 0.20, 0.20, 0.30, 0.38, 0.42, 0.50, 0.35]

  // --- Three.js Scene Setup ---
  const container = sceneRef.value
  const scene = new THREE.Scene()

  const initialWidth = container.clientWidth || 400
  const initialHeight = container.clientHeight || 400

  camera = new THREE.PerspectiveCamera(50, initialWidth / initialHeight, 0.1, 100)
  camera.position.set(1.4, 0.9, 2.0)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(initialWidth, initialHeight)
  renderer.setPixelRatio(window.devicePixelRatio || 2)
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

  scene.add(new THREE.DirectionalLight(0xffffff, 1).position.set(3, 3, 3) && new THREE.DirectionalLight(0xffffff, 1))
  const dirLight = new THREE.DirectionalLight(0xffffff, 1)
  dirLight.position.set(3, 3, 3)
  scene.add(dirLight)
  scene.add(new THREE.AmbientLight(0xffffff, 0.6))

  const vadGroup = new THREE.Group()
  // Static isometric rotation matching image
  vadGroup.rotation.set(0.1, -0.6, 0)
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
    // Add continuous gentle rotation
    vadGroup.rotation.y += 0.002
    // Add a slight vertical float
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
          pointRadius: 2.5, // slightly larger dots like image
          pointBackgroundColor: color,
          pointHoverRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        devicePixelRatio: 3,
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
            ticks: { stepSize: 0.2, font: { size: 8 } } // matching 0, 0.2...1.0
          }
        }
      }
    })
  }

  charts.push(makeChart(arousalRef.value,   aArr, '#4388cc', 'Arousal Level'))
  charts.push(makeChart(dominanceRef.value, dArr, '#54a854', 'Dominance Level'))
  charts.push(makeChart(valenceRef.value,   vArr, '#d14b43', 'Valence Level'))
  charts.push(makeChart(stressRef.value,    sArr, '#8b52a1', 'Stress Level'))
})

onBeforeUnmount(() => {
  if (animationId) cancelAnimationFrame(animationId)
  charts.forEach(c => c && c.destroy())
  if (resizeObserver && sceneRef.value) resizeObserver.unobserve(sceneRef.value)
  if (renderer) { renderer.dispose(); renderer.domElement.remove() }
})
</script>

<style scoped>
.chart-title {
  font-family: serif;
  font-size: 0.9rem;
  font-weight: 700;
  color: #444;
  margin-bottom: 6px;
  text-align: center;
}
.chart-subtitle {
  font-family: serif;
  font-size: 0.6rem;
  color: #888;
  text-align: center;
  margin-bottom: 6px;
  line-height: 1.2;
}
.chart-box {
  /* CRITICAL: allows flex column children to shrink without overflowing slide */
  min-height: 0;
  overflow: hidden;
}
.chart-container {
  position: relative;
  /* CRITICAL: forces Chart.js to respect flex parent boundaries instead of infinitely growing */
  flex: 1 1 0;
  min-height: 0;
  overflow: hidden;
}
</style>
