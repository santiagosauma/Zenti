"use client";
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { renderToStaticMarkup } from 'react-dom/server';
import GeneralCard from '@/components/GeneralCard';

const TEC_MONTERREY = { lat: 25.65119, lng: -100.28713 };

const calculateDistance = (point1, point2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(point2.lat - point1.lat);
  const dLon = toRad(point2.lng - point1.lng);
  const lat1 = toRad(point1.lat);
  const lat2 = toRad(point2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const optimizeRoute = (markers) => {
  if (markers.length <= 2) return markers;

  const orderedMarkers = [markers[0]];
  const remainingMarkers = markers.slice(1);

  while (remainingMarkers.length > 0) {
    const lastMarker = orderedMarkers[orderedMarkers.length - 1];
    let nearestMarkerIndex = 0;
    let nearestDistance = calculateDistance(lastMarker, remainingMarkers[0]);

    for (let i = 1; i < remainingMarkers.length; i++) {
      const distance = calculateDistance(lastMarker, remainingMarkers[i]);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestMarkerIndex = i;
      }
    }

    orderedMarkers.push(remainingMarkers.splice(nearestMarkerIndex, 1)[0]);
  }

  return orderedMarkers;
};

const MapComponent = () => {
  const mapRef = useRef(null);
  const [markers, setMarkers] = useState([TEC_MONTERREY]);
  const [optimizedMarkers, setOptimizedMarkers] = useState([]);
  const [routePolyline, setRoutePolyline] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (mapRef.current) return;

    mapRef.current = L.map('map').setView([TEC_MONTERREY.lat, TEC_MONTERREY.lng], 13);
    L.tileLayer(`https://maps.geoapify.com/v1/tile/osm-carto/{z}/{x}/{y}.png?apiKey=a550c2fd231d4c15bc716e452c93b2da`, {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 20,
    }).addTo(mapRef.current);

    const customIconHtml = renderToStaticMarkup(<FaMapMarkerAlt color="#0A89A6" size="24" />);
    const customIcon = L.divIcon({
      html: customIconHtml,
      className: '',
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      popupAnchor: [0, -24],
    });
    L.marker([TEC_MONTERREY.lat, TEC_MONTERREY.lng], { icon: customIcon })
      .addTo(mapRef.current)
      .bindPopup("Inicio: Tec de Monterrey")
      .openPopup();

    mapRef.current.on('click', function (e) {
      const { lat, lng } = e.latlng;
      const newMarker = { lat, lng, isCompleted: false };

      setMarkers((prevMarkers) => [...prevMarkers, newMarker]);

      const customIconHtml = renderToStaticMarkup(<FaMapMarkerAlt color="red" size="24" />);
      const customIcon = L.divIcon({
        html: customIconHtml,
        className: '',
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [0, -24],
      });

      L.marker([lat, lng], { icon: customIcon })
        .addTo(mapRef.current)
        .bindPopup(`Coordenadas: ${lat.toFixed(5)}, ${lng.toFixed(5)}`)
        .openPopup();
    });
  }, []);

  useEffect(() => {
    const completedMarkers = markers.filter(marker => marker.isCompleted).length;
    const totalMarkers = markers.length;
    const newProgress = totalMarkers > 1 ? Math.round((completedMarkers / (totalMarkers - 1)) * 100) : 0;
    setProgress(newProgress);
  }, [markers]);

  const getMarkerColor = (index, isCompleted, isLast) => {
    if (index === 0) {
      return '#0A89A6';
    } else if (isLast) {
      return isCompleted ? 'green' : 'black';
    } else {
      return isCompleted ? 'green' : 'black';
    }
  };

  const renderMarkers = (markersToRender) => {
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapRef.current.removeLayer(layer);
      }
    });

    markersToRender.forEach((marker, index) => {
      const customIconHtml = renderToStaticMarkup(
        <FaMapMarkerAlt
          color={getMarkerColor(index, marker.isCompleted, index === markersToRender.length - 1)}
          size="24"
        />
      );
      const customIcon = L.divIcon({
        html: customIconHtml,
        className: '',
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [0, -24],
      });

      L.marker([marker.lat, marker.lng], { icon: customIcon })
        .addTo(mapRef.current)
        .bindPopup(`Coordenadas: ${marker.lat.toFixed(5)}, ${marker.lng.toFixed(5)}`);
    });
  };

  const toggleMarkerCompletion = (index) => {
    setMarkers((prevMarkers) =>
      prevMarkers.map((marker, i) =>
        i === index ? { ...marker, isCompleted: !marker.isCompleted } : marker
      )
    );
  };

  const generateRoute = () => {
    if (markers.length < 2) {
      alert("Se necesitan al menos dos marcadores para generar una ruta.");
      return;
    }

    const optimized = optimizeRoute(markers);
    setOptimizedMarkers(optimized);

    const waypoints = optimized.map(coord => `${coord.lat},${coord.lng}`).join('|');
    const url = `https://api.geoapify.com/v1/routing?waypoints=${waypoints}&mode=drive&type=short&apiKey=a550c2fd231d4c15bc716e452c93b2da`;

    fetch(url)
      .then(response => response.json())
      .then(result => {
        if (result.features && result.features.length > 0) {
          const geometry = result.features[0].geometry;
          let coordinates = [];
          if (geometry.type === 'LineString') {
            coordinates = geometry.coordinates;
          } else if (geometry.type === 'MultiLineString') {
            coordinates = geometry.coordinates.flat();
          }
          const latlngs = coordinates.map(coord => [coord[1], coord[0]]);
          if (latlngs.length > 0) {
            if (routePolyline) {
              mapRef.current.removeLayer(routePolyline);
            }
            const polyline = L.polyline(latlngs, { color: 'blue', weight: 5 }).addTo(mapRef.current);
            setRoutePolyline(polyline);
            mapRef.current.fitBounds(polyline.getBounds());
          }
        }
      })
      .catch(error => console.error("Error al obtener la ruta:", error));

    renderMarkers(optimized);
  };

  const cleanMarkers = () => {
    setMarkers([TEC_MONTERREY]);
    setOptimizedMarkers([]);
    setProgress(0);

    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        mapRef.current.removeLayer(layer);
      }
    });

    const customIconHtml = renderToStaticMarkup(<FaMapMarkerAlt color="#0A89A6" size="24" />);
    const customIcon = L.divIcon({
      html: customIconHtml,
      className: '',
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      popupAnchor: [0, -24],
    });
    L.marker([TEC_MONTERREY.lat, TEC_MONTERREY.lng], { icon: customIcon })
      .addTo(mapRef.current)
      .bindPopup("Inicio: Tec de Monterrey");

    if (routePolyline) {
      mapRef.current.removeLayer(routePolyline);
      setRoutePolyline(null);
    }
  };

  const refreshMarkers = () => {
    renderMarkers(markers);
  };

  const handleCheckboxChange = (index) => {
    toggleMarkerCompletion(index);
  };

  const mockData = {
    imageUrl: "/Camiones.png",
    name: "Truck 1",
    id: "T001",
    status: "En ruta",
    contact: "John Doe"
  };

  return (
    <div style={{ width: '100%', backgroundColor: '#CCDEEB', padding: '0' }}>
      <div className="topbar">
        Monitoring
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
        <button className="styledButton" onClick={generateRoute}>Generar Ruta</button>
        <button className="styledButton" onClick={cleanMarkers}>Clean</button>
        <button className="styledButton" onClick={refreshMarkers}>Refresh</button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: '20px' }}>
        <div id="map" style={{ width: '60%', height: '70vh' }}></div>
        <div style={{ width: '30%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <GeneralCard progress={progress} data={mockData} />
          <GeneralCard progress={null} data={mockData} />
          <GeneralCard progress={null} data={mockData} />
          <div style={{ maxHeight: '50vh', overflowY: 'auto', padding: '10px', backgroundColor: 'white', borderRadius: '10px' }}>
            {markers.slice(1).map((marker, index) => (
              <div
                key={index + 1}
                style={{
                  color: 'black',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <span style={{ marginRight: '20px' }}>Destino {index + 1}</span>
                <input
                  type="checkbox"
                  checked={marker.isCompleted}
                  onChange={() => handleCheckboxChange(index + 1)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <style jsx>{`
        body {
          background-color: #CCDEEB;
        }
        .topbar {
          background-color: orange;
          color: white;
          font-family: 'Roboto', sans-serif;
          padding: 15px;
          font-size: 24px;
          text-align: left;
          width: 100%;
          margin: 0;
        }
        .styledButton {
          background-color: #F28627;
          border: none;
          border-radius: 12px;
          padding: 10px 20px;
          font-size: 18px;
          font-family: 'Roboto', sans-serif;
          color: white;
          box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
          margin: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .styledButton:hover {
          box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.3);
        }
        #map {
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default MapComponent;
