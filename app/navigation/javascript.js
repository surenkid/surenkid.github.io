let tim = 1;
setInterval(() => tim++, 10);

async function checkUrlSpeed(url) {
    const startTime = tim;
    try {
        await fetch(url, { mode: "no-cors", cache: "no-store" });
    } catch (error) {
        // 忽略错误，因为我们只关心速度
    }
    const endTime = tim;
    return endTime - startTime;
}

async function updateSpeeds() {
    const speedListItems = document.querySelectorAll(".speedlist li");
    for (let i = 0; i < speedListItems.length; i++) {
        const url = speedListItems[i].querySelector("a").getAttribute("href");
        const speed = await checkUrlSpeed(url);
        const speedElement = document.getElementById(`lineMs${i}`);
        if (speedElement) {
            speedElement.innerHTML = `${speed}ms`;
        } else {
            console.warn(`Element with ID "lineMs${i}" not found.`);
        }
    }
}

updateSpeeds();
