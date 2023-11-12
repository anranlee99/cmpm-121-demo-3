import "leaflet/dist/leaflet.css";
import "./style.css";
import leaflet from "leaflet";

import luck from "./luck";
import "./leafletWorkaround";
import { getCache } from "./geocache";
import * as settings from "./settings";


// const MERRILL_CLASSROOM = leaflet.latLng({
//     lat: 0,
//     lng: 0
// });
const MERRILL_CLASSROOM = leaflet.latLng(settings.PLAYER_ORIGIN);

const mapContainer = document.querySelector<HTMLElement>("#map")!;

const map = leaflet.map(mapContainer, settings.LEAFLET_CONFIG);

leaflet.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a>"
}).addTo(map);

const playerMarker = leaflet.marker(MERRILL_CLASSROOM);
playerMarker.bindTooltip("That's you!");
playerMarker.addTo(map);

const sensorButton = document.querySelector("#sensor")!;
sensorButton.addEventListener("click", () => {
    navigator.geolocation.watchPosition((position) => {
        playerMarker.setLatLng(leaflet.latLng(position.coords.latitude, position.coords.longitude));
        map.setView(playerMarker.getLatLng());
    });
});



function makePit(i: number, j: number) {
    // const bounds = leaflet.latLngBounds([
    //     [MERRILL_CLASSROOM.lat + i * TILE_DEGREES,
    //     MERRILL_CLASSROOM.lng + j * TILE_DEGREES],
    //     [MERRILL_CLASSROOM.lat + (i + 1) * TILE_DEGREES,
    //     MERRILL_CLASSROOM.lng + (j + 1) * TILE_DEGREES],
    // ]);
    const bounds = leaflet.latLngBounds(settings.getBounds(i, j));

    const pit = leaflet.rectangle(bounds) as leaflet.Layer;

    pit.bindPopup(() => {
        return getCache(bounds);
    });
    pit.addTo(map);
}

for (let i = - settings.NEIGHBORHOOD_SIZE; i < settings.NEIGHBORHOOD_SIZE; i++) {
    for (let j = - settings.NEIGHBORHOOD_SIZE; j < settings.NEIGHBORHOOD_SIZE; j++) {
        if (luck([i, j].toString()) < settings.PIT_SPAWN_PROBABILITY) {
            makePit(i, j);
        }
    }
}
