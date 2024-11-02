import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
} from "react-leaflet";
// import L, { Icon } from 'leaflet';
import "leaflet/dist/leaflet.css";
import { GeoJSON } from "react-leaflet";
import { GeoJsonObject } from "geojson";

// import markerIconPng from 'leaflet/dist/images/marker-icon.png';
// import markerShadowPng from 'leaflet/dist/images/marker-shadow.png';

// Define the position type
const position: [number, number] = [1.36025, 103.818758];

const Map = (props: { geojsonData: Array<GeoJsonObject> }) => {
  return (
    <MapContainer
      center={position}
      zoom={12}
      zoomControl={false}
      style={{ height: "100vh", width: "100%" }}
    >
      <ZoomControl position="bottomright" />
      <TileLayer
        url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/dark_all/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
      />

      {props.geojsonData.length > 0 &&
        props.geojsonData.map((feature) => (
          <GeoJSON data={feature} key={"f"}>
            <Popup>
              A pretty CSS3 popup. <br /> Easily customizable.
            </Popup>
          </GeoJSON>
        ))}
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
