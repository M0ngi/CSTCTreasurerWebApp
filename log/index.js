const fs = require('fs')

const LOG_NAME = "./log.data"

const getCurrentDate = () => {
    let curDate = new Date();
    return curDate.toLocaleDateString() + " - " + curDate.toLocaleTimeString();
}

const LEVELS = ["NORMAL", "HIGH", "CRITICAL"]

module.exports.logEvent = (ip, event, level=0, comment="")=>{
    fs.appendFile(
        LOG_NAME, 
        "[" + LEVELS[level] + "]" + "[" + getCurrentDate() + "]" + "[" + ip + "] " + event + " - " + comment + "\n",
        (err)=>{console.log(err);}
        );
}