import luck from "./luck";
import * as leaflet from "leaflet";

const geocacheMap = new Map<string, { serial: string }[]>();
const statusPanel = document.querySelector<HTMLDivElement>("#statusPanel")!;
statusPanel.innerHTML += "No coins yet...";

let currentOpenCacheKey: string | null = null;

const inventoryButton = document.querySelector<HTMLDivElement>("#inventoryButton")!;
const inventory = document.querySelector<HTMLDivElement>("#inventoryContents")!;
inventoryButton.addEventListener("click", () => {
    inventory.style.display = inventory.style.display === "none" ? "block" : "none";

    if (inventory.style.display === "none") {
        inventoryButton.innerHTML = "Inventory + ";
    } else {
        inventoryButton.innerHTML = "Inventory - ";
    }
});

let coins = 0;
export function getCache(bounds: leaflet.LatLngBounds) {
    const i = Math.round(bounds.getCenter().lat * 1e4);
    const j = Math.round(bounds.getCenter().lng * 1e4);
    currentOpenCacheKey = `${i},${j}`;
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

        coinElement.addEventListener("click", () => {
            const isCoinInInventory = coinElement.parentElement === inventory;
            if (isCoinInInventory && currentOpenCacheKey) {
                const coinsAtLocation = geocacheMap.get(currentOpenCacheKey) ?? [];
                coinsAtLocation.push({ serial: coinElement.dataset.serial! });
                geocacheMap.set(currentOpenCacheKey, coinsAtLocation);

                const currentCacheCoinContainer = document.querySelector<HTMLDivElement>(`#coinContainer-${currentOpenCacheKey.split(",")[0]}-${currentOpenCacheKey.split(",")[1]}`);
                if (currentCacheCoinContainer) {
                    currentCacheCoinContainer.appendChild(coinElement);
                }
                document.querySelector<HTMLSpanElement>("#coinsAtLocation")!.innerHTML = coinsAtLocation.length.toString();

                coins--;
            } else {
                const coinIndex = coinsAtLocation.findIndex(coin => coin.serial === coinElement.dataset.serial);
                if (coinIndex !== -1) {
                    coinsAtLocation.splice(coinIndex, 1);
                    geocacheMap.set(currentOpenCacheKey!, coinsAtLocation);
                    inventory.appendChild(coinElement);
                    coins++;
                }
            }
            statusPanel.innerHTML = `${coins} coin${coins !== 1 ? "s" : ""} accumulated`;
        });

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