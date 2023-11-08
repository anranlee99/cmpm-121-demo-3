import luck from "./luck";
const geocacheMap = new Map<string, number>();
const statusPanel = document.querySelector<HTMLDivElement>("#statusPanel")!;
statusPanel.innerHTML = "No coins yet...";
export let coins = 0;
export function getCache(i: number, j: number) {
    let value: number;
    if (geocacheMap.has([i, j].toString())) {
        value = geocacheMap.get([i, j].toString())!;
    } else {
        value = Math.floor(luck([i, j, "initialValue"].toString()) * 100);
        geocacheMap.set([i, j].toString(), value);
    }
        const container = document.querySelector<HTMLDivElement>(`#i${i}j${j}`) ? document.querySelector<HTMLDivElement>(`#i${i}j${j}`)! : document.createElement("div")!;
        console.log(container);
        container.innerHTML = `
                <div id="i${i}j${j}">There is a pit here at "${i},${j}". It has <span id="value">${value}</span> coins.</div>
                <button id="poke">take</button>
                <button id="leave">put</button>`;
        const poke = container.querySelector<HTMLButtonElement>("#poke")!;
        const leave = container.querySelector<HTMLButtonElement>("#leave")!;
        poke.addEventListener("click", () => {
            value--;
            geocacheMap.set([i, j].toString(), value);
            if (value === Math.floor(luck([i, j, "initialValue"].toString()) * 100)) {
                //deleting this pair because it's back to its initial value
                //mem efficient but not time efficient
                geocacheMap.delete([i, j].toString());
            }
            coins++;
            container.querySelector<HTMLSpanElement>("#value")!.innerHTML = value.toString();
            statusPanel.innerHTML = `${coins} coins accumulated`;
        });
        leave.addEventListener("click", () => {
            if (coins) {
                value++;
                geocacheMap.set([i, j].toString(), value);
                if (value === Math.floor(luck([i, j, "initialValue"].toString()) * 100)) {
                    //deleting this pair because it's back to its initial value
                    //mem efficient but not time efficient
                    geocacheMap.delete([i, j].toString());
                }
                coins--;
                container.querySelector<HTMLSpanElement>("#value")!.innerHTML = value.toString();
                statusPanel.innerHTML = `${coins} coins accumulated`;
            }
        });
    
        return container;


}
