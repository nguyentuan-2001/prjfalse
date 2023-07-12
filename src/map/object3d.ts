
import * as THREE from 'three';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';
import data from "../hust/data.json";
import { useRef } from 'react';
import maplibregl, { Map, MercatorCoordinate, CustomLayerInterface, NavigationControl } from 'maplibre-gl';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as BABYLON from 'babylonjs';
import '@babylonjs/loaders';

export function object3d(map: Map){
    const modelOrigin: [number, number] = [148.9819, -35.39847];
    const modelAltitude = 0;
    const modelRotate = [Math.PI / 2, 0, 0];

    const modelAsMercatorCoordinate = maplibregl.MercatorCoordinate.fromLngLat(
      modelOrigin,
      modelAltitude
    );

    const modelTransform = {
      translateX: modelAsMercatorCoordinate.x,
      translateY: modelAsMercatorCoordinate.y,
      translateZ: modelAsMercatorCoordinate.z,
      rotateX: modelRotate[0],
      rotateY: modelRotate[1],
      rotateZ: modelRotate[2],
      scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits()
    };
    

    const customLayer: any = {
      id: '3d-model',
      type: 'custom',
      renderingMode: '3d',
      onAdd: function (map: Map, gl:WebGLRenderingContext) {
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 0, 1); // Cập nhật vị trí camera của bạn tại đây
        this.scene = new THREE.Scene();

        const directionalLight = new THREE.DirectionalLight(0xffffff);
        directionalLight.position.set(0, -70, 100).normalize();
        this.scene.add(directionalLight);

        const directionalLight2 = new THREE.DirectionalLight(0xffffff);
        directionalLight2.position.set(0, 70, 100).normalize();
        this.scene.add(directionalLight2);

        const loader = new GLTFLoader();
        loader.load(
          'https://maplibre.org/maplibre-gl-js-docs/assets/34M_17/34M_17.gltf',
          (gltf) => {
            this.scene.add(gltf.scene);
          }
        );

        this.map = map;

        this.renderer = new THREE.WebGLRenderer({
          canvas: map.getCanvas(),
          context: gl,
          antialias: true
        });

        this.renderer.autoClear = false;
      },
      render: function (gl: WebGLRenderingContext, matrix: number[]) {
        if (!this.camera) {
          this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
          this.camera.position.set(0, 0, 1);
        }
      
        if (!this.scene) {
          this.scene = new THREE.Scene();
          const directionalLight = new THREE.DirectionalLight(0xffffff);
          directionalLight.position.set(0, -70, 100).normalize();
          this.scene.add(directionalLight);
          const directionalLight2 = new THREE.DirectionalLight(0xffffff);
          directionalLight2.position.set(0, 70, 100).normalize();
          this.scene.add(directionalLight2);
          const loader = new GLTFLoader();
          loader.load(
            'https://maplibre.org/maplibre-gl-js-docs/assets/34M_17/34M_17.gltf',
            (gltf) => {
              this.scene.add(gltf.scene);
            }
          );
        }
      
        if (!this.renderer) {
          this.renderer = new THREE.WebGLRenderer({
            canvas: map.getCanvas(),
            context: gl,
            antialias: true
          });
          this.renderer.autoClear = false;
        }
      
        const rotationX = new THREE.Matrix4().makeRotationAxis(
          new THREE.Vector3(1, 0, 0),
          modelTransform.rotateX
        );
        const rotationY = new THREE.Matrix4().makeRotationAxis(
          new THREE.Vector3(0, 1, 0),
          modelTransform.rotateY
        );
        const rotationZ = new THREE.Matrix4().makeRotationAxis(
          new THREE.Vector3(0, 0, 1),
          modelTransform.rotateZ
        );
      
        const m = new THREE.Matrix4().fromArray(matrix);
        const l = new THREE.Matrix4()
          .makeTranslation(
            modelTransform.translateX,
            modelTransform.translateY,
            modelTransform.translateZ
          )
          .scale(
            new THREE.Vector3(
              modelTransform.scale,
              -modelTransform.scale,
              modelTransform.scale
            )
          )
          .multiply(rotationX)
          .multiply(rotationY)
          .multiply(rotationZ);
      
        this.camera.projectionMatrix = m.multiply(l);
        this.renderer.resetState();
        this.renderer.render(this.scene, this.camera);
        this.map.triggerRepaint();
      }
      
      
    };

    map.on('style.load', () => {
      map.addLayer(customLayer);
    });
}


export function label3D(map: maplibregl.Map) {
  const overlays: HTMLElement[] = [];
  const updateOverlayFunctions: (() => void)[] = [];

  map.on('load', function() {
    for (const feature of data.features) {
      const overlay = document.createElement('div');
      overlay.className = 'text_3d';
      overlay.innerHTML = feature.properties.name;
      overlay.style.position = 'absolute';
      overlay.style.pointerEvents = 'none';
      overlay.style.transform = `translateY(-${feature.properties.height}px)`;
      document.body.appendChild(overlay);
      overlays.push(overlay);
      
      const updateOverlay = function() {
        requestAnimationFrame(() => {
          const pixel = map.project(feature.geometry.coordinates as maplibregl.LngLatLike);
          overlay.style.left = pixel.x + 'px';
          overlay.style.top = pixel.y + 'px';
        });
      };
      
      updateOverlayFunctions.push(updateOverlay);

      map.on('move', updateOverlay);
      updateOverlay();
    }
  });

  // Hàm để cập nhật lại overlays
  function updateOverlays() {
    for (let i = 0; i < overlays.length; i++) {
      updateOverlayFunctions[i]();
    }
  }

  // Xóa overlays cũ và cập nhật lại overlays khi bản đồ được thay đổi
  map.on('moveend', function() {
    //removeOverlays();
    updateOverlays();
  });



}

export function car_3d(map: Map) {
  const canvasRef = document.createElement('canvas');

  const engine = new BABYLON.Engine(canvasRef, true);
  const scene = new BABYLON.Scene(engine);

  const camera = new BABYLON.ArcRotateCamera('camera', 0, 0, 0, BABYLON.Vector3.Zero(), scene);
  const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);

  BABYLON.SceneLoader.ImportMesh('', '', '../3d/truck.glb', scene, (meshes) => {
    const mesh = meshes[0];
    mesh.position = BABYLON.Vector3.Zero();
    mesh.scaling = new BABYLON.Vector3(0.1, 0.1, 0.1);
  });

  engine.runRenderLoop(() => {
    if (scene.activeCamera) { // Kiểm tra trường activeCamera trước khi sử dụng
      scene.render();
    }
  });

  window.addEventListener('resize', () => {
    engine.resize();
  });

  return canvasRef;
}
