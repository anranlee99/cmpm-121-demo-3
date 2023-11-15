import leaflet from "leaflet";
const GAMEPLAY_ZOOM_LEVEL = 19;
export const TILE_DEGREES = 1e-4;
export const NEIGHBORHOOD_SIZE = 8;
export const PIT_SPAWN_PROBABILITY = 0.1;

export const PLAYER_ORIGIN = {
    lat: 36.9995,
    lng: - 122.0533
};

export function setPos(i: number, j: number) { 
    PLAYER_ORIGIN.lat = i;
    PLAYER_ORIGIN.lng = j;
}

const latlngTuple = leaflet.latLng(PLAYER_ORIGIN);

export const LEAFLET_CONFIG = {
    center: latlngTuple,
    zoom: GAMEPLAY_ZOOM_LEVEL,
    minZoom: GAMEPLAY_ZOOM_LEVEL,
    maxZoom: GAMEPLAY_ZOOM_LEVEL,
    zoomControl: false,
    scrollWheelZoom: false,
};

export function getBounds(lat: number, lng: number): leaflet.LatLngExpression[] {
    return [
        [lat, lng],
        [lat + TILE_DEGREES, lng + TILE_DEGREES],
    ];
}
