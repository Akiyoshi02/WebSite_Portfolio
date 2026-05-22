/**
 * Lazy-loaded Leaflet map for the contact section.
 * Centers on the Ragama area only; no exact address pin.
 */
import L from "leaflet";

const RAGAMA_CENTER: L.LatLngExpression = [7.027, 79.917];
const AREA_BOUNDS = L.latLngBounds([6.98, 79.86], [7.08, 79.97]);

let map: L.Map | null = null;
let observer: IntersectionObserver | null = null;
let removeInteractionListeners: (() => void) | null = null;

function destroyMap(): void {
  observer?.disconnect();
  observer = null;
  removeInteractionListeners?.();
  removeInteractionListeners = null;
  map?.remove();
  map = null;
}

function createMap(container: HTMLElement): void {
  if (map) return;

  map = L.map(container, {
    center: RAGAMA_CENTER,
    zoom: 12,
    minZoom: 11,
    maxZoom: 14,
    maxBounds: AREA_BOUNDS,
    maxBoundsViscosity: 1,
    scrollWheelZoom: false,
    zoomControl: true,
  });

  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 20,
  }).addTo(map);

  L.circle(RAGAMA_CENTER, {
    radius: 2500,
    fillColor: "#00f5d4",
    fillOpacity: 0.1,
    color: "#00f5d4",
    opacity: 0.35,
    weight: 1.5,
  }).addTo(map);

  L.circleMarker(RAGAMA_CENTER, {
    radius: 7,
    fillColor: "#00f5d4",
    color: "#050810",
    weight: 2,
    fillOpacity: 0.95,
  }).addTo(map);

  const hint = container.parentElement?.querySelector<HTMLElement>(".contact-map-hint");

  const enableWheelZoom = (): void => {
    map?.scrollWheelZoom.enable();
    container.classList.add("is-zoom-active");
    hint?.setAttribute("hidden", "");
  };

  const disableWheelZoom = (): void => {
    map?.scrollWheelZoom.disable();
    container.classList.remove("is-zoom-active");
    hint?.removeAttribute("hidden");
  };

  container.addEventListener("click", enableWheelZoom);
  container.addEventListener("mouseleave", disableWheelZoom);

  removeInteractionListeners = () => {
    container.removeEventListener("click", enableWheelZoom);
    container.removeEventListener("mouseleave", disableWheelZoom);
  };

  requestAnimationFrame(() => map?.invalidateSize());
}

function setupContactMap(): void {
  const el = document.getElementById("contact-map");
  if (!el) {
    destroyMap();
    return;
  }

  if (map && map.getContainer() !== el) destroyMap();

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        createMap(el);
        observer?.disconnect();
        observer = null;
        break;
      }
    },
    { rootMargin: "120px 0px", threshold: 0.1 },
  );
  observer.observe(el);
}

function boot(): void {
  destroyMap();
  setupContactMap();
}

document.addEventListener("astro:before-swap", destroyMap);

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}

document.addEventListener("astro:page-load", boot);
