import './style.css'
import * as THREE from 'three'

import { TTFLoader } from 'three/examples/jsm/loaders/TTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
)
camera.position.x = 0.3
camera.position.y = -0.3
camera.position.z = 2.5
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// scene.add(cube)

/**
 * Card
 */
const group = new THREE.Group()
scene.add(group)

// Frame
const geometry = new THREE.PlaneGeometry(2, 2.5)
const material = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide,
})
const card = new THREE.Mesh(geometry, material)
group.add(card)

// Text
const fontLoader = new THREE.FontLoader()
const ttfLoader = new TTFLoader()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()

const messageEN = `
Happy 
New Year!
`
const messageJP = `
今年 もよろしく
おねがいします
`

fontLoader.load('/fonts/helvetiker_regular.typeface.json', (font) => {
  const textMaterial = new THREE.MeshStandardMaterial({
    color: 'pink',
    // wireframe: true,
  })

  const textGeometry = new THREE.TextBufferGeometry(messageEN, {
    font: font,
    size: 1,
    height: 0.25,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.005,
    bevelOffset: 0,
    bevelSegments: 5,
  })
  textGeometry.center()

  const text = new THREE.Mesh(textGeometry, textMaterial)
  text.position.z = 0.25
  text.position.x = -0.2
  text.position.y = -0.3
  text.scale.setScalar(0.19)
  //   text.rotation.z = 0.05
  group.add(text)
})

ttfLoader.load('/fonts/MochiyPopOne-Regular.ttf', (json) => {
  const ttfFont = fontLoader.parse(json)

  const textMaterial = new THREE.MeshStandardMaterial({
    color: 'orange',
  })
  const textGeometry = new THREE.TextBufferGeometry(messageJP, {
    font: ttfFont,
    size: 0.5,
    height: 0.15,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.005,
    bevelOffset: 0,
    bevelSegments: 5,
  })
  textGeometry.center()

  const text = new THREE.Mesh(textGeometry, textMaterial)
  text.position.z = 0.25
  text.position.x = -0.2
  text.position.y = -0.85

  text.scale.setScalar(0.25)
  group.add(text)
})

/**
 * Ligh
 */
const ambientLight = new THREE.AmbientLight('white', 0.8)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight('white', 2)
scene.add(directionalLight)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let lastElapsedTime = 0

const tick = () => {
  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - lastElapsedTime
  lastElapsedTime = elapsedTime

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
