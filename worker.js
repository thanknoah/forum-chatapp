// Imports
const { 
    workerData, 
    parentPort 
} = require('worker_threads');
const HashMap = require('hashmap');

// Handle Work
parentPort.on('message', (numMsg) => {
    let map = new HashMap(); 
    map.copy(numMsg[0]);

    // Handle Server Startup
    if (numMsg[2] == "startUp") {
        let y = map.keys();
        let array = numMsg[1];

        setInterval(() => {
            for (let x = 0; x < y.length; x++) {
                map.delete(y[x]);
            }
            parentPort.postMessage(map);
        }, 120000);

        setInterval(() => {
            for (let x = 0; x < array.length; x++) {
                map.set(numMsg[1][x], 0);
            }
            parentPort.postMessage(map);
        }, 5000);
    }

    // Set Cooldown for client
    if (numMsg[2] == "setCoolDown") {
        let x = setInterval(() => {
            map.set(numMsg[1], 24);
        }, 1000);

        setTimeout(() => {
            map.set(numMsg[1], 0);
            parentPort.postMessage(map);
            clearInterval(x);
        }, 10000);
    }
});
