import leaflet from "leaflet";
const GAMEPLAY_ZOOM_LEVEL = 19;
const TILE_DEGREES = 1e-4;
export const NEIGHBORHOOD_SIZE = 8;
export const PIT_SPAWN_PROBABILITY = 0.1;

export const PLAYER_ORIGIN = {
    lat: 36.9995,
    lng: - 122.0533
};

const latlngTuple = leaflet.latLng(PLAYER_ORIGIN);

export const LEAFLET_CONFIG = {
    center: latlngTuple,
    zoom: GAMEPLAY_ZOOM_LEVEL,
    minZoom: GAMEPLAY_ZOOM_LEVEL,
    maxZoom: GAMEPLAY_ZOOM_LEVEL,
    zoomControl: false,
    scrollWheelZoom: false
};

export function getBounds(i: number, j: number): leaflet.LatLngExpression[] {
    return [
        [PLAYER_ORIGIN.lat + i * TILE_DEGREES,
        PLAYER_ORIGIN.lng + j * TILE_DEGREES],
        [PLAYER_ORIGIN.lat + (i + 1) * TILE_DEGREES,
        PLAYER_ORIGIN.lng + (j + 1) * TILE_DEGREES],
    ];
}