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
    if (numMsg[2] == "startup") {
        setInterval(() => {
            let y = map.keys();

            for (let x = 0; x < y.length; x++) {
                maps.delete(y[x]);
            }
            for (let x = 0; x < numMsg[1]; x++) {
                maps.set(numMsg[1][x], 0)
            }
            parentPort.postMessage(map);
        }, 120000);
    } 

    // Set Cooldown for client
    if (numMsg[2] == "setCoolDown") {
        setTimeout(() => {
            map.set(numMsg[1], 0);
            parentPort.postMessage(map);
        }, 30000);
    }
});
