import React, { useEffect, useRef } from 'react';
import * as BABYLON from 'babylonjs';
import '@babylonjs/loaders';

const MapComponent: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const customLayerRef = useRef<BABYLON.CustomLayer>();

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const BABYLON = window.BABYLON;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://api.maptiler.com/maps/basic/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL',
      zoom: 18,
      center: [148.9819, -35.3981],
      pitch: 60,
      antialias: true
    });

    const worldOrigin = [148.9819, -35.39847];
    const worldAltitude = 0;
    const worldRotate = [Math.PI / 2, 0, 0];

    const worldOriginMercator = maplibregl.MercatorCoordinate.fromLngLat(
      worldOrigin,
      worldAltitude
    );
    const worldScale = worldOriginMercator.meterInMercatorCoordinateUnits();

    const worldMatrix = BABYLON.Matrix.Compose(
      new BABYLON.Vector3(worldScale, worldScale, worldScale),
      BABYLON.Quaternion.FromEulerAngles(
        worldRotate[0],
        worldRotate[1],
        worldRotate[2]
      ),
      new BABYLON.Vector3(
        worldOriginMercator.x,
        worldOriginMercator.y,
        worldOriginMercator.z
      )
    );

    const customLayer: BABYLON.CustomLayerOptions = {
      id: '3d-model',
      type: 'custom',
      renderingMode: '3d',
      onAdd: (map, gl) => {
        const engine = new BABYLON.Engine(
          gl,
          true,
          {
            useHighPrecisionMatrix: true
          },
          true
        );
        const scene = new BABYLON.Scene(engine);
        scene.autoClear = false;
        scene.detachControl();

        scene.beforeRender = () => {
          engine.wipeCaches(true);
        };

        const camera = new BABYLON.Camera('Camera', new BABYLON.Vector3(0, 0, 0), scene);

        const light = new BABYLON.HemisphericLight(
          'light1',
          new BABYLON.Vector3(0, 0, 100),
          scene
        );
        light.intensity = 0.7;

        new BABYLON.AxesViewer(scene, 10);

        BABYLON.SceneLoader.LoadAssetContainerAsync(
          'https://maplibre.org/maplibre-gl-js/docs/assets/34M_17/34M_17.gltf',
          '',
          scene
        ).then((modelContainer) => {
          modelContainer.addAllToScene();

          const rootMesh = modelContainer.createRootMesh();

          const rootMesh2 = rootMesh.clone();
          rootMesh2.position.x = 25;
          rootMesh2.position.z = 25;
        });

        customLayerRef.current = customLayer;
        customLayerRef.current.map = map;

        return {
          engine,
          scene
        };
      },
      render: (gl, matrix) => {
        const cameraMatrix = BABYLON.Matrix.FromArray(matrix);
        const wvpMatrix = worldMatrix.multiply(cameraMatrix);
        customLayerRef.current?.scene?.getActiveCamera()?.freezeProjectionMatrix(wvpMatrix);
        customLayerRef.current?.scene?.render(false);
        customLayerRef.current?.map?.triggerRepaint();
      }
    };

    map.on('style.load', () => {
      map.addLayer(customLayer);
    });

    return () => {
      map.removeLayer(customLayer.id);
      customLayerRef.current?.engine?.dispose();
      customLayerRef.current?.scene?.dispose();
    };
  }, []);

  return <div id="map" ref={mapContainerRef}></div>;
};

export default MapComponent;
