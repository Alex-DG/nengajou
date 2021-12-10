import './style.css'
import * as THREE from 'three'

import { TTFLoader } from 'three/examples/jsm/loaders/TTFLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Pane } from 'tweakpane'

/***************************************************************************
 * Base
 */
// Debug
const pane = new Pane({ title: 'Scene' })

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

/***************************************************************************
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
controls.enableZoom = false
controls.enableDamping = true

// scene.add(cube)

/***************************************************************************
 * Card
 */
const group = new THREE.Group()
scene.add(group)

// Frame
const geometry = new THREE.PlaneGeometry(1.8, 2.5)
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
    color: '#D22B2B',
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
  text.position.z = 0.3
  text.position.x = -0.1
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
  text.position.z = 0.3
  text.position.x = -0.1
  text.position.y = -0.85

  text.scale.setScalar(0.25)
  group.add(text)
})

/***************************************************************************
 * Model
 */
let mixer
let mask
let sun

const gltfLoader = new GLTFLoader()
const groupMask = new THREE.Group()
scene.add(groupMask)

// Mask
gltfLoader.load('/models/mask.glb', (object) => {
  console.log('👺', { object })

  object.scene.position.z = 0.3
  object.scene.position.x = 0.3
  object.scene.position.y = -0.1

  object.scene.rotation.z = -0.25
  object.scene.scale.setScalar(0.15)

  groupMask.add(object.scene)

  mask = object.scene
})
// Sakura
gltfLoader.load('/models/tree.glb', (object) => {
  console.log('🌴', { object })

  mixer = new THREE.AnimationMixer(object.scene)

  object.scene.position.z = 0.3
  object.scene.position.y = 0.05
  object.scene.position.x = -0.6

  object.scene.rotation.y = -Math.PI + 1

  object.scene.scale.setScalar(0.2)
  group.add(object.scene)

  const action = mixer.clipAction(object.animations[0])
  action.play()
})
// Fox
gltfLoader.load('/models/fox.glb', (object) => {
  console.log('🦊', { object })

  object.scene.position.z = -10
  object.scene.position.y = -2
  object.scene.position.x = -12
  object.scene.rotation.y = Math.PI * 1.5 + 1.25

  const objects = object.scene.children[0].children[0].children[0].children
  sun = objects.find((child) => child.name === 'Icosphere001')

  object.scene.scale.setScalar(0.7)
  scene.add(object.scene)
})

/***************************************************************************
 * Light
 */
const ambientLight = new THREE.AmbientLight('white', 0.95)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight('white', 2)
directionalLight.position.set(0.9, 1.6, -0.3)
scene.add(directionalLight)

const ambientLightFolder = pane.addFolder({ title: 'Ambient Light' })
const directionalLightFolder = pane.addFolder({ title: 'Directional Light' })

ambientLightFolder.addInput(ambientLight, 'intensity', {
  step: 0.01,
  min: 0,
  max: 10,
})
directionalLightFolder.addInput(directionalLight, 'intensity', {
  step: 0.01,
  min: 0,
  max: 10,
})
directionalLightFolder.addInput(directionalLight, 'position')

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true,
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

  // Update Mixer
  mixer?.update(deltaTime * 2)

  // Update Mask
  if (mask) {
    mask.rotation.z = Math.sin(elapsedTime) * 0.15 - 0.3
    groupMask.position.y = Math.sin(elapsedTime) * 0.025
  }

  // Update Sun
  if (sun) {
    sun.rotation.x = elapsedTime * -0.4
  }

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
