import "leaflet/dist/leaflet.css";
import "./style.css";
import leaflet from "leaflet";

import luck from "./luck";
import "./leafletWorkaround";
import { getCache } from "./geocache";
import * as settings from "./settings";

const mapContainer = document.querySelector<HTMLElement>("#map")!;
const map = leaflet.map(mapContainer, settings.LEAFLET_CONFIG);

leaflet.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a>"
}).addTo(map);

const playerMarker = leaflet.marker(settings.PLAYER_ORIGIN).addTo(map);
playerMarker.bindTooltip("That's you!");

const sensorButton = document.querySelector("#sensor")!;
function queryPlayerPos() {
    navigator.geolocation.watchPosition((position) => {
        settings.PLAYER_ORIGIN.lat = position.coords.latitude;
        settings.PLAYER_ORIGIN.lng = position.coords.longitude;
        updateCachesInView();
    }); 
}
//do this at startup to get the player's location
queryPlayerPos();
sensorButton.addEventListener("click", () => {
    queryPlayerPos();
});
const resetButton = document.querySelector("#reset")!;
resetButton.addEventListener("click", () => {
    prompt("Are you sure you want to erase all progress? Type 'yes' to confirm.") === "yes" && localStorage.clear();
});
const southButton = document.querySelector("#south")!;
southButton.addEventListener("click", () => {
    const currentLatLng = playerMarker.getLatLng();
    settings.PLAYER_ORIGIN.lat = currentLatLng.lat - settings.TILE_DEGREES;
    updateCachesInView();
});
const northButton = document.querySelector("#north")!;
northButton.addEventListener("click", () => {
    const currentLatLng = playerMarker.getLatLng();
    settings.PLAYER_ORIGIN.lat = currentLatLng.lat + settings.TILE_DEGREES;
    updateCachesInView();
});
const eastButton = document.querySelector("#east")!;
eastButton.addEventListener("click", () => {
    const currentLatLng = playerMarker.getLatLng();
    settings.PLAYER_ORIGIN.lng = currentLatLng.lng + settings.TILE_DEGREES;
    updateCachesInView();
});
const westButton = document.querySelector("#west")!;
westButton.addEventListener("click", () => {
    const currentLatLng = playerMarker.getLatLng();
    settings.PLAYER_ORIGIN.lng = currentLatLng.lng - settings.TILE_DEGREES;
    updateCachesInView();
});

const pitsOnMap = new Map<string, leaflet.Layer>();


function updateCachesInView() {
    map.setView(settings.PLAYER_ORIGIN);
    playerMarker.setLatLng(settings.PLAYER_ORIGIN);
    const bounds = map.getBounds();

    // Remove pits that are no longer in view
    pitsOnMap.forEach((pit, key) => {
        const [i, j] = key.split(",").map(Number);
        if (!bounds.intersects(leaflet.latLngBounds(settings.getBounds(i, j)))) {
            pit.remove();
            pitsOnMap.delete(key);
        }
    });

    // Add new pits
    for (let i = -settings.NEIGHBORHOOD_SIZE; i < settings.NEIGHBORHOOD_SIZE; i++) {
        for (let j = -settings.NEIGHBORHOOD_SIZE; j < settings.NEIGHBORHOOD_SIZE; j++) {
            const lat = parseFloat((settings.PLAYER_ORIGIN.lat + i * settings.TILE_DEGREES).toFixed(4));
            const lng = parseFloat((settings.PLAYER_ORIGIN.lng + j * settings.TILE_DEGREES).toFixed(4));
            const cacheBounds = leaflet.latLngBounds(settings.getBounds(lat, lng));
            if (bounds.intersects(cacheBounds) && luck([lat,lng].toString()) < settings.PIT_SPAWN_PROBABILITY) {
                makePit(lat, lng);
            }
        }
    }

}

function makePit(i: number, j: number) {
    const bounds = leaflet.latLngBounds(settings.getBounds(i, j));
    const key = `${i},${j}`;
    if (!pitsOnMap.has(key)) {
        const pit = leaflet.rectangle(bounds, { color: "#ff7800", weight: 1 });
        pit.bindPopup(() => getCache(bounds));
        pit.addTo(map);
        pitsOnMap.set(key, pit);
    }
}
updateCachesInView();
