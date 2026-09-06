"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

interface MapProps {
  lat: number;
  lng: number;
  zoom?: number;
  label?: string;
  height?: string;
  className?: string;
}

export function MiniMap({ lat, lng, zoom = 15, label, height = "200px", className }: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      if (!containerRef.current || mapRef.current) return;
      const L = (await import("leaflet")).default;

      if (cancelled) return;

      const map = L.map(containerRef.current, {
        center: [lat, lng],
        zoom,
        scrollWheelZoom: false,
        attributionControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([lat, lng]).addTo(map);
      if (label) {
        marker.bindPopup(label);
      }

      mapRef.current = map;
      markerRef.current = marker;
      setLoaded(true);
    }
    init();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
     
  }, []);

  // Update position when lat/lng changes
  useEffect(() => {
    if (mapRef.current && markerRef.current && loaded) {
      mapRef.current.setView([lat, lng], zoom);
      markerRef.current.setLatLng([lat, lng]);
      if (label) {
        markerRef.current.bindPopup(label);
      }
    }
     
  }, [lat, lng, label, loaded]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ height, width: "100%", borderRadius: "0.75rem", overflow: "hidden", zIndex: 0 }}
      role="img"
      aria-label={label || `Mapa: ${lat}, ${lng}`}
    />
  );
}

/** Hook para geocodificar um endereço via Nominatim */
export function useGeocode(address: string | null) {
  const [coords, setCoords] = useState<{ lat: number; lng: number; displayName?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address || address.trim().length < 5) {
       
      setCoords(null);
      return;
    }
    let active = true;
    setLoading(true);
    setError(null);
    const timer = setTimeout(() => {
      fetch(`/api/geocode?q=${encodeURIComponent(address)}`)
        .then((r) => {
          if (!r.ok) throw new Error("not found");
          return r.json();
        })
        .then((d) => {
          if (active) setCoords({ lat: d.lat, lng: d.lon, displayName: d.displayName });
        })
        .catch((e) => {
          if (active) setError(e.message);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 600); // debounce 600ms

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [address]);

  return { coords, loading, error };
}
