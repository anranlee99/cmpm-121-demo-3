import luck from "./luck";
import * as leaflet from "leaflet";

let geocacheMap: Map<string, { serial: string }[]>;
if (localStorage.geocacheMap) {
    geocacheMap = new Map(JSON.parse(localStorage.geocacheMap as string) as [string, { serial: string }[]][]);
} else {
    geocacheMap = new Map<string, { serial: string }[]>();
}

let inventoryContents: { i: string, j: string, serial: string }[] = [];
if (localStorage.inventoryContents) {
    inventoryContents = JSON.parse(localStorage.inventoryContents as string) as { i: string, j: string, serial: string }[];
}

const statusPanel = document.querySelector<HTMLDivElement>("#statusPanel")!;
statusPanel.innerHTML = `${inventoryContents.length} coin${inventoryContents.length !== 1 ? "s" : ""} accumulated`;

const inventoryButton = document.querySelector<HTMLDivElement>("#inventoryButton")!;
const inventory = document.querySelector<HTMLDivElement>("#inventoryContents")!;
inventoryButton.addEventListener("click", () => {
    inventory.style.display = inventory.style.display === "none" ? "block" : "none";
    inventoryButton.innerHTML = inventory.style.display === "none" ? "Inventory + " : "Inventory - ";
});
let currentOpenCacheKey: string | null = null;
let currentCoinContainerID: string | null = null;
// Function to attach event listener to coin elements
function attachCoinEventListener(coinElement: HTMLButtonElement, i: number, j: number) {
    const coinsAtLocation = geocacheMap.get(`${i},${j}`) ?? [];
    coinElement.addEventListener("click", () => {
        const isCoinInInventory = coinElement.parentElement === inventory;
        const serial = coinElement.dataset.serial!;
        const coinIndex = inventoryContents.findIndex(coin => coin.serial === serial);

        if (isCoinInInventory) {
            inventoryContents.splice(coinIndex, 1);
            const coinsAtLocation = geocacheMap.get(`${i},${j}`) ?? [];
            coinsAtLocation.push({ serial });
            geocacheMap.set(`${i},${j}`, coinsAtLocation);
            localStorage.setItem("inventoryContents", JSON.stringify(inventoryContents));
            document.querySelector<HTMLDivElement>(`#${currentCoinContainerID}`)!.appendChild(coinElement);
        } else {
            inventoryContents.push({ i: i.toString(), j: j.toString(), serial });
            if (coinIndex !== -1) {
                coinsAtLocation.splice(coinIndex, 1);
                geocacheMap.set(`${i},${j}`, coinsAtLocation);
            }
            inventory.appendChild(coinElement);
            localStorage.setItem("inventoryContents", JSON.stringify(inventoryContents));
        }

        statusPanel.innerHTML = `${inventoryContents.length} coin${inventoryContents.length !== 1 ? "s" : ""} accumulated`;
        localStorage.setItem("geocacheMap", JSON.stringify(Array.from(geocacheMap.entries())));
    });
}

// Load coins from inventoryContents into the inventory DOM
inventoryContents.forEach(coin => {
    const coinElement = document.createElement("button");
    coinElement.classList.add("coin");
    coinElement.innerHTML = `i: ${coin.i}, j: ${coin.j}, <br>serial:${coin.serial}`;
    coinElement.dataset.serial = coin.serial;
    attachCoinEventListener(coinElement, parseInt(coin.i), parseInt(coin.j));
    inventory.appendChild(coinElement);
});


export function getCache(bounds: leaflet.LatLngBounds) {
    const i = Math.round(bounds.getCenter().lat * 1e4);
    const j = Math.round(bounds.getCenter().lng * 1e4);
    currentOpenCacheKey = `${i},${j}`;
    currentCoinContainerID = `coinContainer-${i}-${j}`;
    let coinsAtLocation: { serial: string }[];

    if (geocacheMap.has(currentOpenCacheKey)) {
        coinsAtLocation = geocacheMap.get(currentOpenCacheKey)!;
    } else {
        const initialCoinsCount = Math.floor(luck([i, j, "initialCoinsLocation"].toString()) * 10);
        coinsAtLocation = Array.from({ length: initialCoinsCount }, (_, n) => ({
            serial: makeSerial(i, j, n)
        }));
        geocacheMap.set(currentOpenCacheKey, coinsAtLocation);
    }

    const container = document.querySelector<HTMLDivElement>(`#i${i}j${j}`) ?? document.createElement("div");
    container.id = `i${i}j${j}`;
    container.innerHTML = `<div>There is a pit here at i: ${i}, j: ${j}.<br>It has <span id="coinsAtLocation">${coinsAtLocation.length}</span> coins.</div>`;

    const coinContainer = document.createElement("div");
    coinContainer.id = `coinContainer-${i}-${j}`;
    coinsAtLocation.forEach((coinData) => {
        const coinElement = document.createElement("button");
        coinElement.classList.add("coin");
        coinElement.innerHTML = `i: ${i}, j: ${j}, <br>serial:${coinData.serial}`;
        coinElement.dataset.serial = coinData.serial;
        attachCoinEventListener(coinElement, i, j);  // Attach the event listener
        coinContainer.appendChild(coinElement);
    });

    container.appendChild(coinContainer);
    return container;
}


function  makeSerial(i: number, j: number, n: number) {
    const inputs = `${i},${j},${n}`;
    const hash = (luck(inputs) * 10e17).toString(16).slice(0, 16);
    return hash;
}