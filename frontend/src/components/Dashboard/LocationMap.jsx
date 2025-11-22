import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { reverseGeocode } from "../../utils/geocoding";

const DEFAULT_POSITION = [20.5937, 78.9629]; // Center of India

function LocationPicker({ onLocationSelect }) {
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState("Loading address...");

  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      setAddress("Loading address...");
      if (onLocationSelect) onLocationSelect([e.latlng.lat, e.latlng.lng]);
    },
  });

  // Fetch address when position changes
  useEffect(() => {
    if (position) {
      reverseGeocode(position[0], position[1])
        .then(addr => setAddress(addr))
        .catch(() => setAddress(`${position[0].toFixed(6)}, ${position[1].toFixed(6)}`));
    }
  }, [position]);

  return position ? (
    <Marker position={position}>
      <Popup>
        <strong>Selected Location</strong><br />
        <span style={{ fontSize: '12px' }}>{address}</span><br />
        <span style={{ fontSize: '10px', color: '#666' }}>
          {position[0].toFixed(6)}, {position[1].toFixed(6)}
        </span>
      </Popup>
    </Marker>
  ) : null;
}

export default function LocationMap({ onLocationChange }) {
  return (
    <div style={{ width: "100%", height: "350px", borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
      <MapContainer center={DEFAULT_POSITION} zoom={5} style={{ width: "100%", height: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationPicker onLocationSelect={(coords) => {
          if (onLocationChange) onLocationChange(coords);
        }} />
      </MapContainer>
    </div>
  );
}
