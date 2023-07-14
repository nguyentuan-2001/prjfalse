import React, { useEffect } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import Navbar from './components/component';
import data from './hust/data.json';
import { createMap } from './map/mapnew';
import overMap from './map/topographic';
import { markerImage } from './map/markerimage';
import { findway } from './map/findway';
import { searchAddress, updateSuggestions } from './map/search';
import maplibregl from 'maplibre-gl';


const App: React.FC = () => {
  useEffect(() => {
    const map = createMap();
    overMap(map);
    const marker = markerImage(map);
    
    map.on('load', () => {
      searchAddress(map, marker);
      const searchInput = document.getElementById('search__address') as HTMLInputElement;
      if(searchInput){
        searchInput.addEventListener('input', ()=> {
          const searchText = searchInput.value;
          const suggestions = data.features.filter(function(feature) {
              return feature.properties.name.toLowerCase().includes(searchText.toLowerCase());
          });
          updateSuggestions(suggestions, map, marker);
        });
      }
    });

    findway(map);

    var nav = new maplibregl.NavigationControl({
      showCompass: false, // hide the compass button
      showZoom: true // show the zoom buttons
    });
    map.addControl(nav, 'bottom-right');


    

    //delete map if component cancel
    return () => map.remove();
    }, []);

  return (
    <div className="map-wrap" >
      <Navbar/>
    </div>
  );
};

export default App;
