import React, { useEffect } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import Navbar from './components/navbar';
import data from './hust/data.json';
import { createMap } from './map/mapnew';
import overMap from './map/topographic';
import { markerImage, markerText, popupName, zoom, zoomText } from './map/markerimage';
import { closeRightPanel, showAddress, showList } from './map/showinformation';
import { search, searchLeft, searchRight, updateSuggestions } from './map/search';
import { findway } from './map/findway';
import { findrandom } from './map/findwayrandom';
import maplibregl from 'maplibre-gl';
import { realcoordinates } from './map/realcoordinate';
import { car_3d, label3D, object3d } from './map/object3d';


const App: React.FC = () => {
  useEffect(() => {
    //start map
    const map = createMap();

    //label3D(map);
    //load map
    overMap(map);
    //markerText(map);
    //popupName(map);
    

    const marker = markerImage(map);
    // load marker
    map.on('load', () => {
      search(map, marker);
      const searchInput = document.getElementById('search-input') as HTMLInputElement;

      searchInput.addEventListener('input', ()=> {
        const searchText = searchInput.value;
        const suggestions = data.features.filter(function(feature) {
            return feature.properties.name.toLowerCase().includes(searchText.toLowerCase());
        });
        
        updateSuggestions(suggestions, map, marker);
        
      });
      realcoordinates(marker,map);
      const elm = document.getElementById('suggestions-list');
      if (elm) {
        elm.style.display = "none";
      }
    });

    //zoom marker
    zoom(map);
    //zoomText(map);
    
    //close right panel
    closeRightPanel();
    
    // find the way
    findway(map);
    
    //search street random
    findrandom(map);
  
    var nav = new maplibregl.NavigationControl({
      showCompass: false, // hide the compass button
      showZoom: true // show the zoom buttons
    });
    map.addControl(nav, 'bottom-right');

    showList();
    showAddress(map, marker);
    searchLeft(map, marker);
    searchRight(map, marker);

    // setInterval(logPosition, 5000);
    // function logPosition() {
    //   if (navigator.geolocation) {
    //     navigator.geolocation.getCurrentPosition(showPosition1);
    //   } else {
    //     console.log('Geolocation is not supported by this browser.');
    //   }
    // }
  
    // function showPosition1(position: GeolocationPosition) {
    //   const lng = position.coords.longitude;
    //   const lat = position.coords.latitude;
  
    //   console.log("Tọa độ hiện tại:", lng, lat);
    // }
    
    //object3d(map);

    car_3d(map);
    //delete map if component cancel
    return () => map.remove();
    }, []);
    const glbFilePath = './3d/truck.glb';
  return (
    <div className="map-wrap" >
      <Navbar/>
    </div>
  );
};

export default App;
