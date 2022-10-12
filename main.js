import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js'
import { OrbitControls } from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js'
import { DragControls} from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/DragControls.js'

import * as dat from 'dat.gui'

console.log(dat)

const gui = new dat.GUI ()
const world = {
  plane: {
    width: 10
  }
}
gui.add(world.plane, 'width', 1, 500).onChange(() => {
  planeMesh.geometry.dispose()
  planeMesh.geometry = new THREE.PlaneGeometry(world.plane.width, 10, 10, 10)
})


// SCENE

const scene = new THREE.Scene()
scene.background = new THREE.Color(0xbfd1e5)

// CAMERA

const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000)
camera.position.z = 5


// RENDERER

const renderer = new THREE.WebGLRenderer({
  antialias: true
})
renderer.setSize(innerWidth, innerHeight)
renderer.setPixelRatio(devicePixelRatio)
renderer.shadowMap.enabled = true
document.body.appendChild(renderer.domElement)

// CONTROLS

new OrbitControls(camera, renderer.domElement)



// WINDOW RESIZE

export function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}
window.addEventListener('resize', onWindowResize)

const planeGeometry = new THREE.PlaneGeometry(5, 5, 5, 10)
const planeMaterial = new THREE.MeshPhongMaterial( {color: 0xffff00, side: THREE.DoubleSide } )
const planeMesh = new THREE.Mesh( planeGeometry, planeMaterial )
scene.add(planeMesh)

// LIGHT

const light = new THREE.DirectionalLight(0xffffff, 4)
light.position.set(0, 1, 1)
scene.add(light)

const backLight = new THREE.DirectionalLight(0xffffff, 4)
backLight.position.set(0, 0, -1)
scene.add(backLight)

let hemiLight = new THREE.AmbientLight(0xffffff, 0.20)
scene.add(hemiLight)

// FLOOR

function createFloor() {
  let pos = { x: 0, y: -1, z: 3 }
  let scale = { x: 100, y: 2, z: 100 }

  let blockPlane = new THREE.Mesh(new THREE.BoxBufferGeometry(),
       new THREE.MeshPhongMaterial({ color: 0xf9c834 }))
  blockPlane.position.set(pos.x, pos.y, pos.z)
  blockPlane.scale.set(scale.x, scale.y, scale.z)
  blockPlane.castShadow = true
  blockPlane.receiveShadow = true
  scene.add(blockPlane)

  blockPlane.userData.ground = true
}

// BOX

// box
function createBox() {
  let scale = { x: 6, y: 6, z: 6 }
  let pos = { x: 15, y: scale.y / 2, z: 15 }

  let box = new THREE.Mesh(new THREE.BoxBufferGeometry(), 
      new THREE.MeshPhongMaterial({ color: 0xDC143C }))
  box.position.set(pos.x, pos.y, pos.z)
  box.scale.set(scale.x, scale.y, scale.z)
  box.castShadow = true
  box.receiveShadow = true
  scene.add(box)

  box.userData.draggable = true
  box.userData.name = 'BOX'
}

// MOUSE CONTROL CLICK

const mouse = {
  x: undefined,
  y: undefined
}

var raycaster = new THREE.Raycaster() // create once
var clickMouse = new THREE.Vector2() // create once
var moveMouse = new THREE.Vector2() // create once
var draggable;
function intersect(pos) {
    raycaster.setFromCamera(pos, camera)
    return raycaster.intersectObjects(scene.children)
}
window.addEventListener('click', function (event) {
    if (draggable != null) {
        console.log("dropping draggable ".concat(draggable.userData.name))
        draggable = null
        return;
    }
    // THREE RAYCASTER
    clickMouse.x = (event.clientX / window.innerWidth) * 2 - 1
    clickMouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    var found = intersect(clickMouse)
    if (found.length > 0) {
        if (found[0].object.userData.draggable) {
            draggable = found[0].object
            console.log("found draggable ".concat(draggable.userData.name))
        }
    }
})
window.addEventListener('mousemove', function (event) {
    moveMouse.x = (event.clientX / window.innerWidth) * 2 - 1
    moveMouse.y = -(event.clientY / window.innerHeight) * 2 + 1
})

console.log(mouse)

function dragObject() {
    if (draggable != null) {
        var found = intersect(moveMouse)
        if (found.length > 0) {
            for (var i = 0; i < found.length; i++) {
                if (!found[i].object.userData.ground)
                    continue
                var target = found[i].point
                draggable.position.x = target.x
                draggable.position.z = target.z
            }
        }
    }
}



//ANIMATION

function animate() {
  dragObject()
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
//planeMesh.rotation.x += 0.01
}

renderer.render(scene, camera)

createFloor()
createBox()

animate()