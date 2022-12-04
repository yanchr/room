import './style.css'
import * as THREE from 'three'
import { MapControls, OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { KeyframeTrack, Vector2, Vector3 } from 'three'


/**
 * Texture
 */


const parameters = {
    color: 0xff0000,
}
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
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

const pointLight = new THREE.PointLight(0xffffff, 0.5)
pointLight.position.x = 2
pointLight.position.y = 3
pointLight.position.z = 4
scene.add(pointLight)
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
camera.position.z = 2
camera.position.y = 6
camera.position.x = 8
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

    if(sealingDistance < floorDistance) {
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