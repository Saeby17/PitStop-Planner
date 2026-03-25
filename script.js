const form = document.getElementById("strategyForm");

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const track = document.getElementById("track").value;
    const tire = document.getElementById("tire").value;
    const temperature = document.getElementById("temperature").value;
    const weather = document.getElementById("weather").value;
    const race = document.getElementById("race").value;
    const trackData = tracks[track];

    // коэффициент температуры
    let tempK;
    if (temperature < 20) tempK = 0.9;
    else if (temperature <= 30) tempK = 1.0;
    else tempK = 1.15;

    // стратегия смен шин
    let nextTire;
    if (weather === "rain") {
        nextTire = {
            wet: "intermediate",
            intermediate: "hard",
            hard: "medium"
        };
    } else {
        nextTire = {
            soft: "medium",
            medium: "hard",
            hard: "medium"
        };
    }

    // спринт: пит-стопов нет
    if (race === "sprint") {
        const totalTime = Math.floor(trackData.laps / 3) * trackData.lapTime;
        document.getElementById("result").innerHTML = `
            <h2>Спринт</h2>
            <p>Пит-стопы не требуются</p>
            <p>Примерное время: ${totalTime} секунд</p>
        `;
        return;
    }

    // проверка на дождь
    if (weather === "rain" && !["wet", "intermediate"].includes(tire)) {
        document.getElementById("result").innerHTML =
            "<p>Ошибка: выбери дождевые шины</p>";
        return;
    }

    // основной алгоритм
    let lapsLeft = trackData.laps;
    let currentTire = tire;

    let pitLaps = [];
    let tiresUsed = [currentTire];

    let currentLap = 0;

    while (lapsLeft > 0) {
        const baseLife = tireLife[currentTire];
        const realLife = Math.floor(baseLife / (trackData.wearK * tempK));

        // если оставшихся кругов меньше ресурса шины или мало кругов — доезжаем
        if (realLife >= lapsLeft || lapsLeft <= 6) {
            currentLap += lapsLeft;
            lapsLeft = 0;
            break;
        }

        currentLap += realLife;
        lapsLeft -= realLife;

        pitLaps.push(currentLap);

        currentTire = nextTire[currentTire];
        if (!currentTire) break;

        tiresUsed.push(currentTire);
    }

    // формируем текст стратегии
    let strategyText = `<h2>Рекомендуемая стратегия</h2>`;
    strategyText += `<p>Старт: ${tiresUsed[0]}</p>`;
    for (let i = 0; i < pitLaps.length; i++) {
        strategyText += `<p>Пит-стоп ${i + 1} — круг ${pitLaps[i]} → ${tiresUsed[i + 1]}</p>`;
    }
    strategyText += `<p>Количество пит-стопов: ${pitLaps.length}</p>`;

    document.getElementById("result").innerHTML = strategyText;
});

const tracks = {
    melbourne: {laps: 58, lapTime: 80, wearK: 1.1, pitLoss: 20},
    shanghai: {laps: 56, lapTime: 97, wearK: 1.3, pitLoss: 23},
    suzuka: {laps: 53, lapTime: 94, wearK: 1.5, pitLoss: 23},
    sakhir: {laps: 57, lapTime: 94, wearK: 1.4, pitLoss: 23},
    jeddah: {laps: 50, lapTime: 91, wearK: 0.8, pitLoss: 21},
    miami: {laps: 57, lapTime: 90, wearK: 0.9, pitLoss: 21},
    imola: {laps: 63, lapTime: 78, wearK: 0.9, pitLoss: 29},
    monte: {laps: 78, lapTime: 74, wearK: 0.7, pitLoss: 20},
    barcelona: {laps: 66, lapTime: 77, wearK: 1.5, pitLoss: 23},
    montreal: {laps: 70, lapTime: 75, wearK: 0.8, pitLoss: 19},
    spielberg: {laps: 70, lapTime: 68, wearK: 1.2, pitLoss: 21},
    silverstone: {laps: 52, lapTime: 89, wearK: 1.4, pitLoss: 21},
    spa: {laps: 44, lapTime: 107, wearK: 1.2, pitLoss: 22},
    budapest: {laps: 70, lapTime: 81, wearK: 1.3, pitLoss: 21},
    zandvoort: {laps: 72, lapTime: 73, wearK: 1.2, pitLoss: 22},
    monza: {laps: 53, lapTime: 81, wearK: 1.0, pitLoss: 24},
    baku: {laps: 51, lapTime: 104, wearK: 0.8, pitLoss: 23}, 
    marina: {laps: 62, lapTime: 96, wearK: 0.7, pitLoss: 23}, 
    austin: {laps: 56, lapTime: 98, wearK: 1.4, pitLoss: 21},
    mexico: {laps: 71, lapTime: 80, wearK: 1.1, pitLoss: 22},
    paulo: {laps: 71, lapTime: 73, wearK: 1.1, pitLoss: 20},
    vegas: {laps: 50, lapTime: 95, wearK: 0.8, pitLoss: 22}, 
    lusail: {laps: 57, lapTime: 84, wearK: 1.5, pitLoss: 25},
    abudhabi: {laps: 58, lapTime: 87, wearK: 0.9, pitLoss: 21},
};

const tireLife = {
    soft: 15,
    medium: 30,
    hard: 40,
    intermediate: 30,
    wet: 28
};