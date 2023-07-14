import maplibregl, { Map } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import data from '../hust/data.json';

const roads = require('../hust/bd.geojson');
const building = require('../hust/nha.geojson');
const bd =  require('../image/map.png');


function overMap(map: Map){
  map.on('load',(e)=>{
    map.addSource('radar', {
      'type': 'image',
      'url': bd,
      'coordinates': [
        [105.841220, 21.008358], 
        [105.848130, 21.008358],
        [ 105.848130,21.003014],
        [ 105.841220,21.003014]
      ]
    });
    map.addLayer({
        id: 'radar-layer',
        'type': 'raster',
        'source': 'radar',
        'paint': {
          'raster-fade-duration': 0,
          'raster-opacity':1
        }
    });

    map.addSource("street", {
        type: "geojson",
        data: roads,
    });
  
    map.addLayer({
        id: "street-id",
        type: "line",
        source: "street",
        paint: {
        "line-color": "#0066CC",
        "line-opacity": 0,
        "line-width": 2,
        },
    });
    map.addSource('vin-src',{
      type:'geojson',
      data:data
    })

    map.addSource('building',{
      type:'geojson',
      data:building
    })

    map.addLayer({
      id: '3d-building',
      type: 'fill-extrusion',
      source: 'building',
      paint: {
        'fill-extrusion-color': '#1B6B93', // Màu sắc tòa nhà
        'fill-extrusion-height': ['get', 'height'], // Chiều cao tòa nhà
        'fill-extrusion-base': 0, // Độ cao cơ sở của tòa nhà
        'fill-extrusion-opacity':1
        }
    });

    map.addLayer({
      id: 'vin-name',
      type: 'symbol',
      source: 'vin-src',
      layout: {
        'text-field': ['format', ['get', 'name'], { 'font-scale': 1 }],
        'text-size': [
          'interpolate',
          ['linear'],
          ['zoom'],
          15, 0, 15.5, 4, 16, 6, 16.5, 8, 17, 10, 17.5, 12, 18, 14, 18.5, 16, 19, 18
        ],
        'text-anchor': 'bottom', // Đặt text-anchor là 'bottom' để đẩy văn bản lên đỉnh các tòa nhà
        'text-offset': ['interpolate', ['linear'], ['zoom'],
          15, ['literal', [0, 0]], // Độ cao offset ban đầu
          16, ['literal', [0, -5]], // Độ cao offset khi zoom lên
          18, ['literal', [0, -10]] // Độ cao offset khi zoom lên cao hơn
        ],
        'text-font': ['DIN Offc Pro Bold', 'Arial Unicode MS Bold'] // Đặt kiểu chữ đậm
      },
      paint: {
        'text-color': 'white',
        'text-halo-color': 'black',
        'text-halo-width': 1,
      }
    });
  });
}

export default overMap;