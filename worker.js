const { workerData, parentPort }  
        = require('worker_threads') 

parentPort.on('message', (amountOfMessage) => {
    setInterval(() => {
        amountOfMessage.forEach((count,x) => {
            amountOfMessage[x] = 0;
            parentPort.postMessage(amountOfMessage);
        });    
    }, 30000)
});
