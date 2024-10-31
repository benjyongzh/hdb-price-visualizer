import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import L, { Icon } from 'leaflet';
import "leaflet/dist/leaflet.css";

// import markerIconPng from 'leaflet/dist/images/marker-icon.png';
// import markerShadowPng from 'leaflet/dist/images/marker-shadow.png';

// Define the position type
const position: [number, number] = [1.36025, 103.818758];

const Map: React.FC = () => {
  return (
    <MapContainer
      center={position}
      zoom={12}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      {/* <Marker
        position={position}
        icon={
          new Icon({
            iconUrl: markerIconPng,
            shadowUrl: markerShadowPng,
            iconSize: [25, 41],
            iconAnchor: [12, 41]
          })
        }
      >
        <Popup>A pretty popup. Easily customizable.</Popup>
      </Marker> */}
    </MapContainer>
  );
};

export default Map;
