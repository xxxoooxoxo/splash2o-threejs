import * as THREE from 'three'
import * as dat from 'lil-gui'
import gsap from 'gsap'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'


/**
 * Debug
 */
const gui = new dat.GUI()

const parameters = {
    materialColor: '#ffeded'
}

gui
    .addColor(parameters, 'materialColor')
    .onChange(() =>
    {
        material.color.set(parameters.materialColor)
        particlesMaterial.color.set(parameters.materialColor)
    })

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color( 0x333333 );
scene.environment = new RGBELoader().load('/textures/equirectangular/venice_sunset_1k.hdr')
scene.environment.mapping = THREE.EquirectangularReflectionMapping;



// Loaders
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/gltf/')

const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)


// Car parts
const car = new THREE.Group()
const wheels = []

// Loading the car
gltfLoader.load( '/models/mini.gltf', function ( gltf ) {
    let carParts = []

    // copies the car parts into an array
    for(let i = 0; i < gltf.scene.children.length; i++){
        carParts.push(gltf.scene.children[i])
    }

    // renders tires
    for(let i = carParts.length - 4; i < carParts.length; i++){
        if(carParts[i].name === "Mini-WheelFtL" ||
        carParts[i].name === "Mini-WheelFtR" ||
        carParts[i].name === "Mini-WheelBkL" ||
        carParts[i].name === "Mini-WheelBkR"){
            wheels.push(carParts[i])
            car.add(carParts[i])
        } 
    }
    // renders the rest of the car
    for(let i =0; i < carParts.length - 100; i++){
        if(carParts[i].material.name === "glass"){
            carParts[i].material = glassMaterial;
        }
        car.add(carParts[i])
    }
    scene.add(car);
} );



// Materials
const material = new THREE.MeshToonMaterial({
    color: parameters.materialColor,
})

const glassMaterial = new THREE.MeshPhysicalMaterial( {
    color: 0xffffff, metalness: 0.25, roughness: 0, transmission: 1.0
} );

// Objects
const objectsDistance = 4

/* Camera Positions */
const pos1 = { x: -5.4, y: 1.4, z: -2.8 };
const pos2 = { x: 6.9, y: 3.84, z: -4.8 };
const pos3 = { x: .1, y: 10, z: -0.1 };
const pos4 = { x: 5.7, y: 6, z: 4.1 };
const pos5 = { x: -5.7, y: 1.85, z: 1.23 };

// camera array
const cameraPositions = [pos1, pos2, pos3, pos4, pos5];

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


// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.x = cameraPositions[0].x
camera.position.y = cameraPositions[0].y
camera.position.z = cameraPositions[0].z

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.update()


// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.85;

/**
 * Scroll
 */
let scrollY = window.scrollY
let currentSection = 0



// Scroll Animations
window.addEventListener('scroll', () =>
{
    scrollY = window.scrollY
    const newSection = Math.round(scrollY / sizes.height)

    if(newSection != currentSection)
    {
        currentSection = newSection

        gsap.to(
            camera.position,
            {
                duration: 3,
                ease: 'power2.inOut',
                x: cameraPositions[currentSection].x,
                y: cameraPositions[currentSection].y,
                z: cameraPositions[currentSection].z
            }
        )

        if(currentSection === 2){
            gsap.to(
                car.rotation,
                {
                    delay: 0,
                    duration: 2,
                    ease: 'linear',
                    y: - Math.PI / 4 + Math.PI / 2
                }
                )
        } else {
            gsap.to(
                car.rotation,
                {
                    delay: 0,
                    duration: 2,
                    ease: 'linear',
                    y: 0
                }
                )
        }

        // if(currentSection === 2)
        // {
        //     gsap.to(
        //         car.rotation,
        //         {
        //             duration: 3,
        //             ease: 'power2.inOut',
        //             x: 0,
        //             y: - Math.PI / .3,
        //             z: 0
        //         }
        //     )
        // }
        // else
        // {
        //     gsap.to(
        //         car.rotation,
        //         {
        //             duration: 3,
        //             ease: 'power2.inOut',
        //             x: 0,
        //             y: 0,
        //             z: 0
        //         }
        //     )
        // }
    }
})


// gsap.to(
//     camera.position,
//     {
//         duration: 1.5,
//         delay: 2,
//         ease: 'power2.inOut',
//         x: cameraPositions[0].x,
//         y: cameraPositions[0].y,
//         z: cameraPositions[0].z
//     }
// )

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{


    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime
    for ( let i = 0; i < wheels.length; i ++ ) {
        wheels[ i ].rotation.z = elapsedTime * Math.PI;
    }

    // Update Camera
    camera.lookAt(car.position)

    // Render
    renderer.render(scene, camera)

    controls.update()

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}


tick()