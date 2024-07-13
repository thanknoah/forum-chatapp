const { 
    workerData, 
    parentPort 
} = require('worker_threads');
const HashMap = require('hashmap');
const { Console } = require('console');

parentPort.on('message', (numMsg) => {
    let map = new HashMap(); 
    map.copy(numMsg[0]);

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

    if (numMsg[2] == "setCoolDown") {
        setTimeout(() => {
            map.set(numMsg[1], 0);
            parentPort.postMessage(map);
        }, 30000);
    }
});