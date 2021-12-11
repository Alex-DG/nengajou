import './style.css'
import * as THREE from 'three'

import { TTFLoader } from 'three/examples/jsm/loaders/TTFLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
// import { Pane } from 'tweakpane'
import * as TWEEN from '@tweenjs/tween.js'

import cardVertexShader from './shaders/card/vertex.glsl'
import cardFragmentShader from './shaders/card/fragment.glsl'

import firefliesVertexShader from './shaders/fireflies/vertex.glsl'
import firefliesFragmentShader from './shaders/fireflies/fragment.glsl'

import waterVertexShader from './shaders/water/vertex.glsl'
import waterFragmentShader from './shaders/water/fragment.glsl'

/**
 * Loader
 */
const progressText = document.getElementById('progress')
const loadingManager = new THREE.LoadingManager()
loadingManager.onProgress = (_, loaded, total) => {
  const progress = (loaded / total) * 100
  progressText.innerText = `${Math.floor(progress)}%`

  if (progress === 100) {
    const loadingScreen = document.getElementById('loading-screen')

    const opacity = { value: 1 }

    const tween = new TWEEN.Tween(opacity)
      .to({ value: 0 }, 1000)
      .onUpdate(() => {
        loadingScreen.style.opacity = opacity.value
      })
      .onComplete(() => {
        loadingScreen.style.display = 'none'
      })
      .easing(TWEEN.Easing.Quadratic.Out)

    tween.start()
    console.log('Complete!')
  }
}

/***************************************************************************
 * Base
 */
// Debug
// const pane = new Pane({ title: 'Scene' })
let debugOject = {}

// Colors
debugOject.depthColor = '#ffffff'
debugOject.surfaceColor = '#8bcce1'

// Colors
debugOject.depthColor2 = '#186691'
debugOject.surfaceColor2 = '#9bd8ff'

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
controls.enableZoom = true
controls.enableDamping = true

/***************************************************************************
 * Fireflies
 */
// Geometry
const firefliesGeometry = new THREE.BufferGeometry()
const firefliesCount = 120
const positionArray = new Float32Array(firefliesCount * 3)

const scaleArray = new Float32Array(firefliesCount) // add scale randomness

for (let i = 0; i < firefliesCount; i++) {
  positionArray[i * 3 + 0] = (Math.random() - 0.5) * 4
  positionArray[i * 3 + 1] = (Math.random() - 0.5) * 4
  positionArray[i * 3 + 2] = (Math.random() - 0.5) * 4

  scaleArray[i] = Math.random()
}

firefliesGeometry.setAttribute(
  'position',
  new THREE.BufferAttribute(positionArray, 3)
)
firefliesGeometry.setAttribute(
  'aScale',
  new THREE.BufferAttribute(scaleArray, 1)
)

const firefliesMaterial = new THREE.ShaderMaterial({
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  uniforms: {
    uTime: { value: 0 },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    uSize: { value: 100 },
  },
  vertexShader: firefliesVertexShader,
  fragmentShader: firefliesFragmentShader,
})

// Points
const fireflies = new THREE.Points(firefliesGeometry, firefliesMaterial)
scene.add(fireflies)

/***************************************************************************
 * Card
 */
const group = new THREE.Group()
scene.add(group)

// Frame
const cardGeometry = new THREE.PlaneBufferGeometry(1.8, 2.5, 1, 1)

const cardMaterial = new THREE.ShaderMaterial({
  vertexShader: cardVertexShader,
  fragmentShader: cardFragmentShader,
  transparent: true,
  side: THREE.DoubleSide,
  // wireframe: true,
  uniforms: {
    uTime: { value: 0.0 },

    uBigWavesSpeed: { value: 0.75 },
    uBigWavesElevation: { value: 0.15 },
    uBigWavesFrequency: { value: new THREE.Vector2(4, 1.5) },

    uSmallWavesElevation: { value: 0.15 },
    uSmallWavesFrequency: { value: 3 },
    uSmallWavesSpeed: { value: 0.2 },
    uSmallIterations: { value: 4 },

    uDepthColor: { value: new THREE.Color(debugOject.depthColor) },
    uSurfaceColor: { value: new THREE.Color(debugOject.surfaceColor) },
    uColorOffset: { value: 0.522 },
    uColorMultiplier: { value: 8.8 },
  },
})
const card = new THREE.Mesh(cardGeometry, cardMaterial)
group.add(card)

// const cardMatFolder = pane.addFolder({ title: 'Card Material' })

// cardMatFolder.addInput(debugOject, 'depthColor').on('change', ({ value }) => {
//   cardMaterial.uniforms.uDepthColor.value = new THREE.Color(value)
// })
// cardMatFolder.addInput(debugOject, 'surfaceColor').on('change', ({ value }) => {
//   cardMaterial.uniforms.uSurfaceColor.value = new THREE.Color(value)
// })
// cardMatFolder.addInput(cardMaterial.uniforms.uColorOffset, 'value', {
//   min: 0,
//   max: 1,
//   step: 0.001,
//   label: 'Color Offset',
// })
// cardMatFolder.addInput(cardMaterial.uniforms.uColorMultiplier, 'value', {
//   min: 0,
//   max: 10,
//   step: 0.001,
//   label: 'Color Multiplier',
// })

// cardMatFolder.addInput(cardMaterial.uniforms.uBigWavesElevation, 'value', {
//   min: 0,
//   max: 1,
//   step: 0.001,
//   label: 'Big Waves Elevation',
// })
// cardMatFolder.addInput(cardMaterial.uniforms.uBigWavesFrequency.value, 'x', {
//   min: 0,
//   max: 10,
//   step: 0.001,
//   label: 'Big Waves Frequency X',
// })
// cardMatFolder.addInput(cardMaterial.uniforms.uBigWavesFrequency.value, 'y', {
//   min: 0,
//   max: 10,
//   step: 0.001,
//   label: 'Big Waves Frequency Y',
// })
// cardMatFolder.addInput(cardMaterial.uniforms.uBigWavesSpeed, 'value', {
//   min: 0,
//   max: 4,
//   step: 0.001,
//   label: 'Big Waves Speed',
// })

// cardMatFolder.addInput(cardMaterial.uniforms.uSmallWavesElevation, 'value', {
//   min: 0,
//   max: 1,
//   step: 0.001,
//   label: 'Small Waves Elevation',
// })
// cardMatFolder.addInput(cardMaterial.uniforms.uSmallWavesFrequency, 'value', {
//   min: 0,
//   max: 30,
//   step: 0.001,
//   label: 'Small Waves Frequency',
// })
// cardMatFolder.addInput(cardMaterial.uniforms.uSmallWavesSpeed, 'value', {
//   min: 0,
//   max: 4,
//   step: 0.001,
//   label: 'Small Waves Speed',
// })
// cardMatFolder.addInput(cardMaterial.uniforms.uSmallIterations, 'value', {
//   min: 0,
//   max: 5,
//   step: 1,
//   label: 'Small Iteration',
// })

/***************************************************************************
 * Water
 */

const waterGeometry = new THREE.PlaneGeometry(120, 120, 42, 42)

const waterMaterial = new THREE.ShaderMaterial({
  vertexShader: waterVertexShader,
  fragmentShader: waterFragmentShader,
  transparent: true,
  wireframe: true,
  uniforms: {
    uTime: { value: 0.0 },

    uBigWavesSpeed: { value: 0.75 },
    uBigWavesElevation: { value: 0.674 },
    uBigWavesFrequency: { value: new THREE.Vector2(2.5, 6.522) },

    uSmallWavesElevation: { value: 0.05 },
    uSmallWavesFrequency: { value: 3 },
    uSmallWavesSpeed: { value: 0.2 },
    uSmallIterations: { value: 4 },

    uDepthColor: { value: new THREE.Color(debugOject.depthColor2) },
    uSurfaceColor: { value: new THREE.Color(debugOject.surfaceColor2) },
    uColorOffset: { value: 0.08 },
    uColorMultiplier: { value: 5 },
  },
})

const water = new THREE.Mesh(waterGeometry, waterMaterial)
water.position.z = -40
water.position.y = -4
// water.rotation.x = -Math.PI / 2 + 0.1
water.rotation.x = -Math.PI * 0.5 + 0.1
scene.add(water)

// const waterMatFolder = pane.addFolder({ title: 'Water Material' })

// waterMatFolder.addInput(debugOject, 'depthColor').on('change', ({ value }) => {
//   waterMaterial.uniforms.uDepthColor.value = new THREE.Color(value)
// })
// waterMatFolder
//   .addInput(debugOject, 'surfaceColor')
//   .on('change', ({ value }) => {
//     cardMaterial.uniforms.uSurfaceColor.value = new THREE.Color(value)
//   })
// waterMatFolder.addInput(waterMaterial.uniforms.uColorOffset, 'value', {
//   min: 0,
//   max: 1,
//   step: 0.001,
//   label: 'Color Offset',
// })
// waterMatFolder.addInput(waterMaterial.uniforms.uColorMultiplier, 'value', {
//   min: 0,
//   max: 10,
//   step: 0.001,
//   label: 'Color Multiplier',
// })

// waterMatFolder.addInput(waterMaterial.uniforms.uBigWavesElevation, 'value', {
//   min: 0,
//   max: 1,
//   step: 0.001,
//   label: 'Big Waves Elevation',
// })
// waterMatFolder.addInput(waterMaterial.uniforms.uBigWavesFrequency.value, 'x', {
//   min: 0,
//   max: 10,
//   step: 0.001,
//   label: 'Big Waves Frequency X',
// })
// waterMatFolder.addInput(waterMaterial.uniforms.uBigWavesFrequency.value, 'y', {
//   min: 0,
//   max: 10,
//   step: 0.001,
//   label: 'Big Waves Frequency Y',
// })
// waterMatFolder.addInput(waterMaterial.uniforms.uBigWavesSpeed, 'value', {
//   min: 0,
//   max: 4,
//   step: 0.001,
//   label: 'Big Waves Speed',
// })

// waterMatFolder.addInput(waterMaterial.uniforms.uSmallWavesElevation, 'value', {
//   min: 0,
//   max: 1,
//   step: 0.001,
//   label: 'Small Waves Elevation',
// })
// waterMatFolder.addInput(waterMaterial.uniforms.uSmallWavesFrequency, 'value', {
//   min: 0,
//   max: 30,
//   step: 0.001,
//   label: 'Small Waves Frequency',
// })
// waterMatFolder.addInput(waterMaterial.uniforms.uSmallWavesSpeed, 'value', {
//   min: 0,
//   max: 4,
//   step: 0.001,
//   label: 'Small Waves Speed',
// })
// waterMatFolder.addInput(waterMaterial.uniforms.uSmallIterations, 'value', {
//   min: 0,
//   max: 5,
//   step: 1,
//   label: 'Small Iteration',
// })

/***************************************************************************
 * Text
 */
const fontLoader = new THREE.FontLoader(loadingManager)
const ttfLoader = new TTFLoader(loadingManager)

let textYear

const happyNewYear = `
明けまして
おめでとう
`
const year = `2022`

const messageJP = `
今年 もよろしく
おねがいします
`

fontLoader.load('/fonts/helvetiker_regular.typeface.json', (font) => {
  const textMaterial = new THREE.MeshStandardMaterial({
    color: '#D22B2B',
  })
  const textGeometry = new THREE.TextBufferGeometry(year, {
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
  text.position.z = 0.4
  text.position.y = 1.1
  text.position.x = -0.5
  text.rotation.z = 0.4

  text.scale.setScalar(0.25)

  textYear = text

  group.add(text)
})

ttfLoader.load('/fonts/MochiyPopOne-Regular.ttf', (json) => {
  const ttfFont = fontLoader.parse(json)

  const textMaterial = new THREE.MeshStandardMaterial({
    color: 'orange',
    wireframe: true,
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
  text.position.y = -0.8
  text.scale.setScalar(0.25)

  const textGeometry2 = new THREE.TextBufferGeometry(happyNewYear, {
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
  textGeometry2.center()

  const textMaterial2 = textMaterial.clone()
  textMaterial2.color = new THREE.Color('#D22B2B')

  const text2 = new THREE.Mesh(textGeometry2, textMaterial2)
  text2.position.z = 0.3
  text2.position.x = -0.22
  text2.position.y = -0.3
  text2.scale.setScalar(0.28)

  group.add(text, text2)
})

/***************************************************************************
 * Model
 */
let mixer
let mask
let sun
let chihiro

const textureLoader = new THREE.TextureLoader(loadingManager)
const gltfLoader = new GLTFLoader(loadingManager)
const groupMask = new THREE.Group()
scene.add(groupMask)

// Mask
gltfLoader.load('/models/mask.glb', (object) => {
  console.log('👺', { object })

  object.scene.position.z = 0.3
  object.scene.position.x = 0.55
  object.scene.position.y = -0.25

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
  object.scene.position.x = -0.65

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
// Tori
gltfLoader.load('/models/tori.glb', (object) => {
  console.log('🌁', { object })

  textureLoader.load('/textures/matcap/4.png', (texture) => {
    const matCap = new THREE.MeshMatcapMaterial({
      // color: new THREE.Color('#ff008f'),
      matcap: texture,
      transparent: true,
      opacity: 1,
      // blending: THREE.NormalBlending,
    })
    object.scene.traverse((node) => {
      if (node.isMesh) {
        node.material = matCap
      }
    })

    object.scene.position.z = 0.25
    object.scene.position.y = 0.05
    object.scene.position.x = 0.2

    object.scene.scale.setScalar(0.8)

    scene.add(object.scene)
  })
})
// Chihiro
gltfLoader.load('/models/chihiro.glb', (object) => {
  console.log('Chihiro', { object })

  object.scene.position.z = 0.4
  object.scene.position.y = 0.05
  object.scene.position.x = 0.13

  object.scene.scale.setScalar(0.15)

  chihiro = object.scene

  scene.add(object.scene)
})

/***************************************************************************
 * Light
 */
const ambientLight = new THREE.AmbientLight('white', 1)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight('white', 1.41)
directionalLight.position.set(0, 1.0, 0.1)
scene.add(directionalLight)

// const ambientLightFolder = pane.addFolder({ title: 'Ambient Light' })
// const directionalLightFolder = pane.addFolder({ title: 'Directional Light' })

// ambientLightFolder.addInput(ambientLight, 'intensity', {
//   step: 0.01,
//   min: 0,
//   max: 10,
// })

// directionalLightFolder.addInput(directionalLight, 'intensity', {
//   step: 0.01,
//   min: 0,
//   max: 10,
// })
// directionalLightFolder.addInput(directionalLight.position, 'x', {
//   step: 0.01,
//   min: -10,
//   max: 10,
// })
// directionalLightFolder.addInput(directionalLight.position, 'y', {
//   step: 0.01,
//   min: -10,
//   max: 10,
// })
// directionalLightFolder.addInput(directionalLight.position, 'z', {
//   step: 0.01,
//   min: -10,
//   max: 10,
// })

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true,
})
// renderer.outputEncoding = THREE.RGBEEncoding
// renderer.physicallyCorrectLights = true
// renderer.toneMapping = THREE.FilmicToneMapping
// renderer.toneMappingExposure = 1.5
// renderer.outputEncoding = THREE.sRGBEncoding

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Fog
 */
const color = 0xd9afd9 // white  0xdfe9f3 //
const near = 10.0
const far = 90
scene.fog = new THREE.Fog(color, near, far)

/**
 * Animate
 */
const clock = new THREE.Clock()
let lastElapsedTime = 0

const tick = () => {
  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - lastElapsedTime
  lastElapsedTime = elapsedTime

  TWEEN.update()

  // Update Mixer
  mixer?.update(deltaTime * 2)

  // Update Fireflies
  firefliesMaterial.uniforms.uTime.value = elapsedTime

  // Update Card
  cardMaterial.uniforms.uTime.value = elapsedTime

  // Update Card
  waterMaterial.uniforms.uTime.value = elapsedTime

  // Update Text
  if (textYear) {
    textYear.position.y = textYear.position.y + Math.sin(elapsedTime) * 0.0005
  }

  // Update Chihiro
  if (chihiro) {
    chihiro.rotation.y = Math.sin(elapsedTime) * 0.04
    chihiro.position.z = chihiro.position.z + Math.sin(elapsedTime) * 0.0004
  }

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
