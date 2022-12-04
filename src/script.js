import './style.css'
import * as THREE from 'three'
import { MapControls, OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { KeyframeTrack, Vector2, Vector3 } from 'three'

//import gsap from 'gsap'
import * as dat from 'lil-gui'

/**
 * Debug
 */
 const gui = new dat.GUI()


/**
 * Texture
 */


const parameters = {
    color: 0xff0000,
    lightColor: 0xff9000}
/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Loaders
 */
 const dracoLoader = new DRACOLoader()
 dracoLoader.setDecoderPath('draco/')
 
 // GLTF loader
 const gltfLoader = new GLTFLoader()
 gltfLoader.setDRACOLoader(dracoLoader)

 /**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2)
scene.add(ambientLight)

const spotLight = new THREE.SpotLight(parameters.lightColor, 1, 10, Math.PI * 0.45, 0.25, 0.2)
spotLight.position.set(-0.2, 2.4, 0.07)
scene.add(spotLight)
gui.addColor(parameters, 'lightColor').onChange(() =>
{
    spotLight.color.set(parameters.lightColor)
})
gui
    .add(spotLight, 'intensity')
    .min(0)
    .max(3)
    .step(0.01)

const spotlightHelper = new THREE.SpotLightHelper(spotLight, 0.2)
//scene.add(spotlightHelper)

/**
 * Materials
*/
const basicMaterial = new THREE.MeshBasicMaterial({
    color: 0x999999,
    wireframe: false
})

const normalMaterial = new THREE.MeshNormalMaterial()
normalMaterial.metalness = 0.7
normalMaterial.roughness = 0.2

const playMaterial = new THREE.MeshLambertMaterial()
/**
 * Object
 */
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: parameters.color })
const mesh = new THREE.Mesh(geometry, material)
mesh.material = normalMaterial

const coffeMeshes = new THREE.Group()
scene.add(coffeMeshes)
gltfLoader.load(
    'My-Room.glb',
    (gltf) => 
    {
        const children = [...gltf.scene.children]
        for (const child of children) {
            child.material = playMaterial
            manageWalls(child)
            if(child.children.length >= 1){
                child.children.forEach(smallChild => {
                    console.log("Look where this lays and why this commens logs now. ")
                })
            }
            coffeMeshes.add(child)
            
        }
        manageWallVisibility()
    }
)

function manageWalls(child) {
    switch(child.name) {
        case "top-wall":
            break
        case "bottom-wall":
            break
        case "left-wall":
            break
        case "right-wall":
            break
        default: 
    }
}
/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
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
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(9, 5, 4)
//camera.position.set(2, 7, 2)
scene.add(camera)



// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

controls.addEventListener( 'change', () => {
   manageWallVisibility()
} );

function getWallMesh(name)  {
    return coffeMeshes.children.find(child => child.name == name)
}

function getWallMeshDistanceToCamera(mesh) {
    return camera.position.distanceTo(mesh.position)
}

function manageWallVisibility() {
    const topWall = getWallMesh('top-wall')
    const topWallDistance = getWallMeshDistanceToCamera(topWall)
    const bottomWall = getWallMesh('bottom-wall')
    const bottomWallDistance = getWallMeshDistanceToCamera(bottomWall)
    
    const leftWall = getWallMesh('left-wall')
    const leftWallDistance = getWallMeshDistanceToCamera(leftWall)
    const rightWall = getWallMesh('right-wall')
    const rightWallDistance = getWallMeshDistanceToCamera(rightWall)
    
    const sealing = getWallMesh('sealing')
    const sealingDistance = getWallMeshDistanceToCamera(sealing)
    const floor = getWallMesh('floor')
    const floorDistance = getWallMeshDistanceToCamera(floor)

    if(topWallDistance < bottomWallDistance) {
        topWall.visible = false
        bottomWall.visible = true
    } else {
        bottomWall.visible = false
        topWall.visible = true
    }

    if(leftWallDistance < rightWallDistance) {
        leftWall.visible = false
        rightWall.visible = true
    } else {
        rightWall.visible = false
        leftWall.visible = true
    }

    if(camera.position.y >= -0.5) {
        sealing.visible = false
        floor.visible = true
    } else {
        floor.visible = false
        sealing.visible = true
    }
}
/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()