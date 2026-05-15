import React, { useMemo, useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Icon, DivIcon } from "leaflet";
import type { LeafletMouseEvent } from "leaflet";
import "leaflet/dist/leaflet.css";
import type { DataCenterAsset } from "@/network";
import { DataCenterPopup } from "./DataCenterPopup";
import Supercluster from "supercluster";
import type { BBox } from "geojson";
import { BlurMask } from "../common";
import { useAuthStore } from "@/store";

interface ExplorerMapProps {
  data: DataCenterAsset[];
  loading?: boolean;
  onViewDetails: (id: string) => void;
  isFilterOpenInMobile: boolean;
}

// Create a custom marker icon
const createCustomIcon = (status?: string) => {
  let color = "blue"; // default

  switch (status?.toLowerCase()) {
    case "commissioned":
      color = "green";
      break;
    case "announced":
      color = "blue";
      break;
    case "cancelled":
      color = "red";
      break;
    case "under construction":
      color = "yellow";
      break;
    default:
      color = "blue";
  }

  return new Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

// Create cluster icon
const createClusterIcon = (count: number, size: number) => {
  return new DivIcon({
    html: `<div class="cluster-marker" style="width: ${size}px; height: ${size}px;">
      <span>${count}</span>
    </div>`,
    className: "custom-cluster-icon",
    iconSize: [size, size],
  });
};

// Component that uses SuperCluster to render markers
const MapMarkers: React.FC<{
  data: DataCenterAsset[];
  onViewDetails: (id: string) => void;
}> = ({ data, onViewDetails }) => {
   const { user, shouldBlur } = useAuthStore();
   const isTrialUser = shouldBlur();
  const map = useMap();
  const [bounds, setBounds] = useState<BBox | null>(null);
  const [zoom, setZoom] = useState(map.getZoom());
  const customIcon = createCustomIcon();
  const hoverTimeoutRef = React.useRef<{ [key: string]: NodeJS.Timeout }>({});

  // Transform data to GeoJSON format for SuperCluster
  const points = useMemo(() => {
    return data.map((datacenter) => ({
      type: "Feature" as const,
      properties: {
        cluster: false,
        datacenter,
        id: datacenter.dc_id || datacenter.id,
      },
      geometry: {
        type: "Point" as const,
        coordinates: [
          parseFloat(datacenter.longitude?.toString() || "0"),
          parseFloat(datacenter.latitude?.toString() || "0"),
        ],
      },
    }));
  }, [data]);

  // Initialize SuperCluster with points data
  const supercluster = useMemo(() => {
    const cluster = new Supercluster({
      radius: 40, // Reduced clustering radius for more granular clusters
      maxZoom: 22, // Increased maximum zoom level to ensure complete expansion
      minZoom: 0, // Minimum zoom level for clusters
      minPoints: 2, // Minimum points to form a cluster
      extent: 512, // Standard tile size
      nodeSize: 64, // Default KD-tree node size
      log: false, // Don't log timing info
    });

    if (points.length) {
      cluster.load(points);
    }
    return cluster;
  }, [points]);

  // Update bounds and zoom when map changes
  useEffect(() => {
    let isUpdating = false;
    
    const updateMap = () => {
      // Prevent rapid successive updates
      if (isUpdating) return;
      
      isUpdating = true;
      requestAnimationFrame(() => {
        const b = map.getBounds();
        setBounds([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
        setZoom(map.getZoom());
        isUpdating = false;
      });
    };

    updateMap();

    map.on("moveend", updateMap);

    return () => {
      map.off("moveend", updateMap);
    };
  }, [map]);

  // Get clusters based on current bounds and zoom
  const clusters = useMemo(() => {
    if (!bounds || !supercluster) return [];

    // Add a buffer to the bounds to ensure we get points that might be just outside view
    const bufferedBounds: BBox = [
      bounds[0] - 0.1, // Add buffer to west
      bounds[1] - 0.1, // Add buffer to south
      bounds[2] + 0.1, // Add buffer to east
      bounds[3] + 0.1, // Add buffer to north
    ];

    // Get clusters from supercluster with expanded bounds
    const clusterData = supercluster.getClusters(bufferedBounds, zoom);

    return clusterData;
  }, [bounds, zoom, supercluster]);

  // Handle marker hover events - wrapped in useCallback to prevent recreation
  const handleMarkerMouseEnter = React.useCallback((
    markerId: string,
    event: LeafletMouseEvent
  ) => {
    // Clear any existing timeout for this marker
    if (hoverTimeoutRef.current[markerId]) {
      clearTimeout(hoverTimeoutRef.current[markerId]);
    }

    // Set timeout to open popup after delay
    hoverTimeoutRef.current[markerId] = setTimeout(() => {
      const marker = event.target;
      if (marker && marker.openPopup) {
        marker.openPopup();
      }
    }, 600);
  }, []);

  const handleMarkerMouseLeave = React.useCallback((markerId: string) => {
    // Clear timeout when mouse leaves
    if (hoverTimeoutRef.current[markerId]) {
      clearTimeout(hoverTimeoutRef.current[markerId]);
      delete hoverTimeoutRef.current[markerId];
    }
  }, []);

  // Cleanup timeouts on unmount
  React.useEffect(() => {
    const timeouts = hoverTimeoutRef.current;
    return () => {
      Object.values(timeouts).forEach((timeout) => {
        clearTimeout(timeout);
      });
    };
  }, []);

  // Handle cluster click - wrapped in useCallback
  const handleClusterClick = React.useCallback((
    clusterId: number,
    latitude: number,
    longitude: number
  ) => {
    // Get cluster expansion zoom - increase by 2 to ensure better expansion
    const clusterExpansionZoom =
      supercluster.getClusterExpansionZoom(clusterId);
    const expansionZoom = Math.min(
      // Add 1 more zoom level to better expand the cluster
      clusterExpansionZoom + 1,
      22
    );

    // Fly to the cluster with animation
    map.flyTo([latitude, longitude], expansionZoom, {
      animate: true,
      duration: 0.5,
    });
  }, [map, supercluster]);

  // Handle cluster hover events - wrapped in useCallback
  const handleClusterMouseEnter = React.useCallback((
    clusterId: number,
    event: LeafletMouseEvent
  ) => {
    // Clear any existing timeout for this cluster
    if (hoverTimeoutRef.current[`cluster-${clusterId}`]) {
      clearTimeout(hoverTimeoutRef.current[`cluster-${clusterId}`]);
    }

    // Set timeout to open popup after delay
    hoverTimeoutRef.current[`cluster-${clusterId}`] = setTimeout(() => {
      const clusterLeaves = supercluster.getLeaves(clusterId, Infinity);
      const pointCount = clusterLeaves.length;

      // Get unique countries and operators from the cluster
      const countries = new Set<string>();
      const operators = new Set<string>();
      const cities = new Set<string>();
      clusterLeaves.forEach((leaf) => {
        const datacenter = leaf.properties.datacenter;
        if (datacenter.country) {
          for (const ele of datacenter.country) countries.add(ele);
        }
        if (datacenter["data_center_operator"]) {
          for (const ele of datacenter.data_center_operator)
            operators.add(ele.company);
        }
        if (datacenter.city) {
          for (const ele of datacenter.city) {
            cities.add(ele.city);
          }
        }
      });

      // Create data center list HTML
      const dataCenterListHTML = clusterLeaves
        .map((leaf) => {
          const datacenter = leaf.properties.datacenter;
          const dcId = datacenter.dc_id || datacenter.id;
          const facilityName =
            datacenter["data_center_facility_name"] || "Unknown Facility";
          return `
          <div class="flex items-center justify-between py-1 border-b border-gray-100 last:border-b-0">
            <div class="flex-1 min-w-0">
              <div class="text-xs font-medium text-gray-900 truncate" title="${facilityName}">
                ${facilityName}
              </div>
              <div class="text-xs text-gray-500">${dcId}</div>
            </div>
            <button 
              class="ml-2 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex-shrink-0"
              onclick="window.navigateToDataCenter && window.navigateToDataCenter('${dcId}')"
            >
              Go To
            </button>
          </div>
        `;
        })
        .join("");

      const popupContent = `
        <div class="cluster-hover-popup">
          <div class="font-semibold text-gray-900 mb-3">
            📍 ${pointCount} Data Center${
        pointCount > 1 ? "s" : ""
      } in this area
          </div>
          
          <div class="space-y-1 text-sm mb-3">
            ${
              cities.size > 0
                ? `
              <div>
                <span class="text-gray-600">Cities:</span> 
                <span class="font-medium">${Array.from(cities)
                  .slice(0, 3)
                  .join(", ")}${
                    cities.size > 3 ? ` +${cities.size - 3} more` : ""
                  }</span>
              </div>
            `
                : ""
            }
            ${
              countries.size > 0
                ? `
              <div>
                <span class="text-gray-600">Countries:</span> 
                <span class="font-medium">${Array.from(countries)
                  .slice(0, 2)
                  .join(", ")}${
                    countries.size > 2 ? ` +${countries.size - 2} more` : ""
                  }</span>
              </div>
            `
                : ""
            }
            ${
              operators.size > 0
                ? `
              <div>
                <span class="text-gray-600">Operators:</span> 
                <span class="font-medium">${Array.from(operators)
                  .slice(0, 2)
                  .join(", ")}${
                    operators.size > 2 ? ` +${operators.size - 2} more` : ""
                  }</span>
              </div>
            `
                : ""
            }
          </div>

          <div class="border-t border-gray-200 pt-2">
            <div class="font-semibold text-gray-900 mb-2 text-sm">Data Centers:</div>
            <div class="max-h-40 overflow-y-auto space-y-1">
              ${dataCenterListHTML}
            </div>
          </div>
          
          <div class="mt-3 pt-2 border-t border-gray-200 text-xs text-gray-500">
            Click cluster to zoom in and explore
          </div>
        </div>
      `;

      // Set up global navigation function
      (
        window as typeof window & {
          navigateToDataCenter?: (id: string) => void;
        }
      ).navigateToDataCenter = (id: string) => {
        onViewDetails(id);
        // Close the popup
        const marker = event.target;
        if (marker && marker.closePopup) {
          marker.closePopup();
        }
      };

      const marker = event.target;
      if (marker && marker.bindPopup && marker.openPopup) {
        marker
          .bindPopup(popupContent, {
            className: "cluster-info-popup",
            closeButton: false,
            maxWidth: 320,
            offset: [0, -10],
            autoPan: true,
            autoPanPadding: [50, 50],
            keepInView: false,
          })
          .openPopup();

        // Make popup persistent on hover
        const popup = marker.getPopup();
        if (popup) {
          const popupElement = popup.getElement();
          if (popupElement) {
            // Ensure normal rendering with no blur
            popupElement.style.backdropFilter = "";
            popupElement.style.webkitBackdropFilter = "";
            popupElement.style.background = "";
            popupElement.style.filter = "";
            popupElement.style.borderRadius = "";
            popupElement.addEventListener("mouseenter", () => {
              // Keep popup open when hovering over it
            });
            popupElement.addEventListener("mouseleave", () => {
              // Close popup when leaving the popup area
              marker.closePopup();
            });
          }
        }
      }
    }, 600);
  }, [supercluster, onViewDetails, user]);

  const handleClusterMouseLeave = React.useCallback((
    clusterId: number,
    event: LeafletMouseEvent
  ) => {
    // Clear timeout when mouse leaves
    if (hoverTimeoutRef.current[`cluster-${clusterId}`]) {
      clearTimeout(hoverTimeoutRef.current[`cluster-${clusterId}`]);
      delete hoverTimeoutRef.current[`cluster-${clusterId}`];
    }

    // Add a small delay before closing to allow moving to popup
    setTimeout(() => {
      const marker = event.target;
      const popup = marker.getPopup();
      if (popup && popup.getElement()) {
        const popupElement = popup.getElement();
        // Only close if not hovering over popup
        if (!popupElement.matches(":hover")) {
          marker.closePopup();
        }
      }
    }, 100);
  }, []);

  return (
    <>
      {clusters.map((cluster) => {
        // Get cluster coordinates
        const [longitude, latitude] = cluster.geometry.coordinates;

        // Check if it's a cluster
        if (cluster.properties.cluster) {
          const pointCount = cluster.properties.point_count;

          // Dynamic sizing based on count for better visual representation
          const size =
            pointCount < 5
              ? 34
              : pointCount < 10
              ? 38
              : pointCount < 25
              ? 42
              : pointCount < 50
              ? 46
              : pointCount < 100
              ? 50
              : pointCount < 500
              ? 55
              : pointCount < 1000
              ? 60
              : 65;

          // Format count display for large numbers
          const formattedCount =
            pointCount > 999
              ? `${(pointCount / 1000).toFixed(1)}k`
              : pointCount;

          return (
            <Marker
              key={`cluster-${cluster.properties.cluster_id}`}
              position={[latitude, longitude]}
              icon={createClusterIcon(formattedCount, size)}
              eventHandlers={{
                click: () =>
                  handleClusterClick(
                    cluster.properties.cluster_id as number,
                    latitude,
                    longitude
                  ),
                mouseover: (event) =>
                  handleClusterMouseEnter(
                    cluster.properties.cluster_id as number,
                    event
                  ),
                mouseout: (event) =>
                  handleClusterMouseLeave(
                    cluster.properties.cluster_id as number,
                    event
                  ),
              }}
            />
          );
        }

        // It's a single point
        const datacenter = cluster.properties.datacenter;
        const markerId = datacenter.dc_id || datacenter.id;

        return (
          <Marker
            key={datacenter.id}
            position={[latitude, longitude]}
            icon={createCustomIcon(datacenter.data_center_status)}
            eventHandlers={{
              mouseover: (event) => handleMarkerMouseEnter(markerId, event),
              mouseout: () => handleMarkerMouseLeave(markerId),
            }}
          >
            <Popup
              className="custom-popup"
              maxWidth={window.innerWidth < 768 ? 280 : 320}
              autoPan={true}
              autoPanPadding={[50, 50]}
              keepInView={false}
            >
              <BlurMask shouldBlur={isTrialUser}>
              <div className="min-w-48 sm:min-w-64 max-w-72 sm:max-w-80 h-full">
                <DataCenterPopup
                  datacenter={datacenter}
                  onViewDetails={onViewDetails}
                />
              </div>
              </BlurMask>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};

export const ExplorerMap: React.FC<ExplorerMapProps> = ({
  data,
  loading,
  onViewDetails,
  isFilterOpenInMobile,
}) => {
  // Filter data to only include items with valid coordinates
  
 
  const validDataCenters = data.filter((item) => {
    const lat = parseFloat(item.latitude?.toString() || "");
    const lng = parseFloat(item.longitude?.toString() || "");

    const isValid =
      item.latitude !== null &&
      item.latitude !== undefined &&
      item.longitude !== null &&
      item.longitude !== undefined &&
      !isNaN(lat) &&
      !isNaN(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180 &&
      !(lat === 0 && lng === 0); // Exclude default [0,0] coordinates

    return isValid;
  });

  // Add CSS styles for cluster markers
  React.useEffect(() => {
    // Add styles for cluster markers if they don't exist already
    if (!document.getElementById("cluster-styles")) {
      const styleEl = document.createElement("style");
      styleEl.id = "cluster-styles";
      styleEl.innerHTML = `
        .custom-cluster-icon {
          background: none;
        }
        .cluster-marker {
          display: flex;
          justify-content: center;
          align-items: center;
          color: white;
          background-color: #3a8ece;
          border-radius: 50%;
          border: 4px solid rgba(59, 130, 246, 0.5);
          box-shadow: 0 0 0 2px white, 0 3px 10px rgba(0,0,0,0.2);
          font-weight: bold;
          font-size: 13px;
          text-align: center;
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        .cluster-marker:hover {
          transform: scale(1.1);
          background-color: #3a8ece;
        }
        .leaflet-container .leaflet-control-zoom {
          margin-top: 70px !important;
          box-shadow: 0 1px 5px rgba(0,0,0,0.2);
          border: none;
        }
        .leaflet-control-zoom a {
          color: #1e40af !important;
          transition: all 0.2s ease;
        }
        .leaflet-control-zoom a:hover {
          color: white !important;
          background-color: #1e40af !important;
        }
        .cluster-info-popup .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          background: white;
          max-height: 400px;
        }
        .cluster-info-popup .leaflet-popup-content {
          margin: 16px;
          font-family: system-ui, -apple-system, sans-serif;
          overflow: visible;
        }
        .cluster-info-popup .leaflet-popup-tip {
          background: white;
        }
        .cluster-hover-popup {
          min-width: 280px;
          max-width: 320px;
        }
        .cluster-hover-popup .font-semibold {
          font-weight: 600;
        }
        .cluster-hover-popup .text-gray-900 {
          color: #111827;
        }
        .cluster-hover-popup .text-gray-600 {
          color: #4b5563;
        }
        .cluster-hover-popup .text-gray-500 {
          color: #6b7280;
        }
        .cluster-hover-popup .text-gray-100 {
          color: #f3f4f6;
        }
        .cluster-hover-popup .font-medium {
          font-weight: 500;
        }
        .cluster-hover-popup .border-gray-200 {
          border-color: #e5e7eb;
        }
        .cluster-hover-popup .border-gray-100 {
          border-color: #f3f4f6;
        }
        .cluster-hover-popup .space-y-1 > * + * {
          margin-top: 0.25rem;
        }
        .cluster-hover-popup .mb-2 {
          margin-bottom: 0.5rem;
        }
        .cluster-hover-popup .mb-3 {
          margin-bottom: 0.75rem;
        }
        .cluster-hover-popup .mt-2 {
          margin-top: 0.5rem;
        }
        .cluster-hover-popup .mt-3 {
          margin-top: 0.75rem;
        }
        .cluster-hover-popup .pt-2 {
          padding-top: 0.5rem;
        }
        .cluster-hover-popup .py-1 {
          padding-top: 0.25rem;
          padding-bottom: 0.25rem;
        }
        .cluster-hover-popup .px-2 {
          padding-left: 0.5rem;
          padding-right: 0.5rem;
        }
        .cluster-hover-popup .ml-2 {
          margin-left: 0.5rem;
        }
        .cluster-hover-popup .border-t {
          border-top-width: 1px;
        }
        .cluster-hover-popup .border-b {
          border-bottom-width: 1px;
        }
        .cluster-hover-popup .text-sm {
          font-size: 0.875rem;
        }
        .cluster-hover-popup .text-xs {
          font-size: 0.75rem;
        }
        .cluster-hover-popup .max-h-40 {
          max-height: 10rem;
        }
        .cluster-hover-popup .overflow-y-auto {
          overflow-y: auto;
        }
        .cluster-hover-popup .flex {
          display: flex;
        }
        .cluster-hover-popup .items-center {
          align-items: center;
        }
        .cluster-hover-popup .justify-between {
          justify-content: space-between;
        }
        .cluster-hover-popup .flex-1 {
          flex: 1 1 0%;
        }
        .cluster-hover-popup .flex-shrink-0 {
          flex-shrink: 0;
        }
        .cluster-hover-popup .min-w-0 {
          min-width: 0px;
        }
        .cluster-hover-popup .truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .cluster-hover-popup .rounded {
          border-radius: 0.25rem;
        }
        .cluster-hover-popup .bg-blue-600 {
          background-color: #2563eb;
        }
        .cluster-hover-popup .text-white {
          color: white;
        }
        .cluster-hover-popup .transition-colors {
          transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 150ms;
        }
        .cluster-hover-popup button:hover.bg-blue-700 {
          background-color: #1d4ed8;
        }
        .cluster-hover-popup .last\\:border-b-0:last-child {
          border-bottom-width: 0px;
        }
        .cluster-hover-popup .max-h-40::-webkit-scrollbar {
          width: 4px;
        }
        .cluster-hover-popup .max-h-40::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 2px;
        }
        .cluster-hover-popup .max-h-40::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 2px;
        }
        .cluster-hover-popup .max-h-40::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        @media (max-width: 640px) {
          .cluster-marker {
            font-size: 11px;
          }
          .cluster-info-popup .leaflet-popup-content-wrapper {
            max-width: 250px !important;
          }
        }
      `;
      document.head.appendChild(styleEl);
    }
  }, []);

  // don't show map when filter is open on mobile device
  if (isFilterOpenInMobile) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 rounded-b-lg">
        <div className="text-center px-4">
          <div className="text-gray-400 text-base lg:text-lg mb-2">
            Close the filters or Navbar to see the Maps
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 h-full">
      {/* Map Header */}
      <div className="px-4 lg:px-6 py-3 lg:py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-base lg:text-lg font-medium text-gray-900">
            Map View
          </h3>
          <div className="text-xs lg:text-sm text-gray-500">
            <span className="hidden sm:inline">Showing </span>
            {validDataCenters.length} data centers
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="h-full relative">
        {validDataCenters.length > 0 ? (
          <MapContainer
            center={[20, 10]} // Default to a more central global view
            zoom={window.innerWidth < 768 ? 2 : 3} // Better zoom level for both mobile and desktop
            minZoom={2} // Prevent zooming out beyond global view
            maxZoom={18} // Allow detailed zoom in
            className="w-full h-full rounded-b-lg"
            style={{ height: "calc(100% - 60px)" }} // Adjusted for mobile header
            zoomControl={true} // Always show zoom controls
            preferCanvas={true} // Use canvas renderer for better performance
            zoomSnap={0.5} // Allow finer zoom levels
            zoomDelta={0.5} // Finer zoom increments
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              subdomains="abcd"
              noWrap={true}
            />

            {/* Use the supercluster-powered component */}
            <MapMarkers data={validDataCenters} onViewDetails={onViewDetails} />
          </MapContainer>
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-50 rounded-b-lg">
            <div className="text-center px-4">
              <div className="text-gray-400 text-base lg:text-lg mb-2">
                No Valid Coordinates
              </div>
              <div className="text-gray-500 text-sm">
                None of the data centers have valid latitude/longitude
                coordinates
              </div>
            </div>
          </div>
        )}

        {/* No Data Message */}
        {validDataCenters.length === 0 && !loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-75 rounded-b-lg">
            <div className="text-center px-4">
              <div className="text-gray-400 text-base lg:text-lg mb-2">
                No Data Centers Found
              </div>
              <div className="text-gray-500 text-sm">
                Try adjusting your filters or search criteria
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
