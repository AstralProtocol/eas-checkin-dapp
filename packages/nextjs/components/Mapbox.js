// eslint-disable-line import/no-webpack-loader-syntax
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "!mapbox-gl";
// import { blo } from "blo";
import "mapbox-gl/dist/mapbox-gl.css";

// import { useAccount } from "wagmi";

mapboxgl.accessToken = "pk.eyJ1Ijoicm9uY2h1Y2siLCJhIjoiY2x2Y2o5Z2drMGY3cjJrcGI4b2xsNzdtaCJ9.gi5RJ8qRhTSwfYuhVwhmvQ";

export default function Mapbox({
  setIsControlsActive = bool => bool,
  height = "70vh",
  setLatLng = arr => arr,
  isCheckInActive = false,
  // attestationsData = {},
  latLngAttestation = [],
  setIsLoading = bool => bool,
}) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const [lng, setLng] = useState(0);
  const [lat, setLat] = useState(0);
  const [zoom, setZoom] = useState(6);

  useEffect(() => {
    function showPosition(position) {
      console.log("showPosition called");
      const lon = position.coords.longitude;
      const lat = position.coords.latitude;
     
      // Fly to center without setting lat,lon state
      map?.current?.flyTo({
        center: [lat, lon],
        essential: true,
      });
      
      console.log("✔📍 User coordinates set:[", lon, lat, "]");
    }

    function showError(error) {
      console.log('showError called');
      switch (error.code) {
        case error.PERMISSION_DENIED:
          console.log("User denied the request for Geolocation.");
          break;
        case error.POSITION_UNAVAILABLE:
          console.log("Location information is unavailable.");
          break;
        case error.TIMEOUT:
          console.log("The request to get user location timed out.");
          break;
        case error.UNKNOWN_ERROR:
          console.log("An unknown error occurred.");
          break;
      }
      console.log("Falling back to default coordinates (0, 0)");
      setLng(0);
      setLat(0);
    }

    if (navigator.geolocation) {
      console.log("NAVIGATOR");
      navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
      console.log("Geolocation is not supported by this browser. Falling back to default coordinates (0, 0).");
      setLng(0);
      setLat(0); // repeat?
    }
  }, []);

  // Loading state side effect
  useEffect(() => {
    console.log('[🧪 DEBUG](loading useEffect)')
    setIsLoading(false);
  }, [setIsLoading]);

  // Init map side effect
  useEffect(() => {
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/standard",
        center: latLngAttestation.length > 0 ? [latLngAttestation[1], latLngAttestation[0]] : [lng, lat],
        zoom: zoom,
        attributionControl: false,
      });
    }

    // We should pull attestations overlay out into a different set of code no? Feels like we need a few mapping utils?
    if (latLngAttestation.length > 0) {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      // Set state variables
      setLng(latLngAttestation[0]);
      setLat(latLngAttestation[1]);

      const el = document.createElement("div");
      el.className = "marker bg-primary";
      // el.src = "/eas_logo.png";
      // el.style.width = "40px";
      // el.style.height = "40px";
      // Add a pin to the map

      var newMarker = new mapboxgl.Marker(el)
        .setLngLat([latLngAttestation[1], latLngAttestation[0]])
        .addTo(map.current);

      // Animated flyTo to position marker at center of map
      map.current.flyTo({
        center: [latLngAttestation[1], latLngAttestation[0]],
        essential: true,
      });

      // Add to state
      markersRef.current.push(newMarker);
    }

    map.current?.on("move", () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });

    map.current?.on("click", e => {
      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      // Set state variables
      setLng(latLngAttestation.length > 0 ? latLngAttestation[0] : e.lngLat.lng);
      setLat(latLngAttestation.length > 0 ? latLngAttestation[1] : e.lngLat.lat);

      // Set state on parent page (to pass on checkin)
      setLatLng([lat, lng]);

      const el = document.createElement("div");
      el.className = "marker bg-primary";
      // const el = document.createElement("img");
      // el.className = "marker";
      // el.src = "/eas_logo.png";
      // el.style.width = "30px";
      // el.style.height = "30px";
      // el.style.borderRadius = "50%";
      // Add a pin to the map
      var newMarker = new mapboxgl.Marker(el).setLngLat(e.lngLat).addTo(map.current);

      // Animated flyTo to position marker at center of map
      map.current.flyTo({
        center: e.lngLat,
        essential: true,
      });

      // Add to state
      markersRef.current.push(newMarker);

      // Bring up prop value to control map view
      setIsControlsActive && setIsControlsActive(true);
      // Done loading
    });
  }, [latLngAttestation, lng, lat, zoom, setLatLng, setIsControlsActive]);

  // Canvas resize side effect
  useEffect(() => {
    var mapCanvas = document.getElementsByClassName("mapboxgl-canvas")[0];
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/standard",
        center: [lng, lat],
        zoom: zoom,
      });
    }

    if (isCheckInActive) {
      mapCanvas.style.height = "20vh";
      map.current.style.height = "20vh";
      mapContainer.current.style.height = "20vh";
      map.current.resize(50);
    } else {
      mapContainer.current.style.height = "80vh";
      map.current.resize();
    }
  }, [isCheckInActive, zoom, lat, lng]);


  return <div ref={mapContainer} className="card mx-4 mt-4 map-container" style={{ height }} />;
}
