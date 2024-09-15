"use client"
import { useEffect, useRef } from 'react';

const MapComponent = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    // Dynamically load the HERE Maps JavaScript API script
    const script = document.createElement('script');
    script.src = 'https://js.api.here.com/v3/3.1/mapsjs-core.js';
    script.async = true;
    document.body.appendChild(script);

    const scriptService = document.createElement('script');
    scriptService.src = 'https://js.api.here.com/v3/3.1/mapsjs-service.js';
    scriptService.async = true;
    document.body.appendChild(scriptService);

    const scriptUI = document.createElement('script');
    scriptUI.src = 'https://js.api.here.com/v3/3.1/mapsjs-ui.js';
    scriptUI.async = true;
    document.body.appendChild(scriptUI);

    const scriptEvents = document.createElement('script');
    scriptEvents.src = 'https://js.api.here.com/v3/3.1/mapsjs-mapevents.js';
    scriptEvents.async = true;
    document.body.appendChild(scriptEvents);

    scriptEvents.onload = () => {
      const platform = new H.service.Platform({
        apikey: 'VlJkIfiAz_-FwQ9fFKsPvyUOb58iUEwqqzG9yI-MR90'
      });

      const defaultLayers = platform.createDefaultLayers();

      const map = new H.Map(
        mapRef.current,
        defaultLayers.vector.normal.map,
        {
          zoom: 12,
          center: { lat: 25.6866, lng: -100.3161 } // Monterrey
        }
      );

      const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
      H.ui.UI.createDefault(map, defaultLayers);
    };

    // Clean up scripts on unmount
    return () => {
      document.body.removeChild(script);
      document.body.removeChild(scriptService);
      document.body.removeChild(scriptUI);
      document.body.removeChild(scriptEvents);
    };
  }, []);

  return <div ref={mapRef} style={{ height: '500px', width: '100%' }} />;
};

export default MapComponent;
