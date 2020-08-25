const fs = require('fs');
const promises = require('./promises');
const browsers = require("./browsers");
const moment = require('moment')


function getWebkitTime(historyTime)
{
    let current_time = Date.now();
    
    let end_time = current_time+11644473600001;
    let start_time = current_time+11644473600001 - 60000*historyTime;
    start_time = start_time * 1000;
    end_time = end_time *1000;
    console.log(start_time)
    console.log(end_time);
    return [start_time,end_time]
}
function getWebkitTime_firefox(historyTime)
{
    let current_time = Date.now();
    let end_time = current_time*1000;
    let start_time = (current_time-60000*historyTime)*1000;
    return [start_time,end_time]

}
async function getBrowserhistory(path,url,params)
{
    let browerhistory = [];
    await promises.open(path).catch((e) => {
        //console.log(e);
        return [];
    });
    await promises.all(url).then((rows) => {
        browerhistory = [...rows];
    }).catch((e) =>{ //console.log(e)
    });
    promises.db.close()
    return [...browerhistory];
}




async function getChromeBrowserRecords(paths, browserName, historyTime)
{
    let broswerHistory = [];
    let browser;
    for(let i=0;i<paths.length;i++)
    {
        console.log(1);
        let path = paths[i];
        let newPath = path+'1';
        await promises.copyFile(path,newPath).then(() => console.log("copied")).catch((err) => {
            //console.log(err)
        })
        let url = `SELECT urls.url, visit_time, visit_duration FROM `
        +`visits INNER JOIN urls on urls.id = visits.url WHERE visit_time > ${historyTime[0]} and (visit_time + visit_duration) <= ${historyTime[1]} ORDER BY visit_time DESC`;
        browser = await getBrowserhistory(newPath,url);
        broswerHistory.push(...browser)
        fs.unlink(newPath,(err) => {
            //console.log(err);
        });
    }
    broswerHistory.forEach((row) => {
        if(!row.visit_duration) row.visit_duration = 0;
        if(!row.rev_host) row.rev_host = "";
        else{
            let host = row.rev_host;
            host = host.toString();
            host = host.reverse();
            host = host.slice(1,host.length)
            row.rev_host = host;
        }
        row.end_time = row.visit_time + row.visit_duration;
        row.visit_time = new Date((row.visit_time/1000)-11644473600001)
        row.visit_time = moment(row.visit_time).format("MMMM Do YYYY, h:mm:ss a")
        row.end_time = new Date((row.end_time/1000)-11644473600001)
        row.end_time = moment(row.end_time).format("MMMM Do YYYY, h:mm:ss a")
        
        row.browser_name = browserName;
    })
    return broswerHistory;
}



async function getFirefoxBasedRecords(paths, browserName, historyTime)
{
    let broswerHistory = [];
    let browser;
    
    console.log(moment(historyTime[0]/1000).format("MMMM Do YYYY, h:mm:ss a"))
    for(let i=0;i<paths.length;i++)
    {
        console.log(1);
        let path = paths[i];
        //await promises.copyFile(path,newPath).then(() => console.log("copied")).catch((err) => console.log(err))
        let url = `select DISTINCT url,last_visit_date as visit_time,rev_host from moz_places WHERE visit_time > ${historyTime[0]} ORDER BY visit_time ASC`;
        browser = await getBrowserhistory(path,url,"params");
        broswerHistory.push(...browser)
        // fs.unlink(newPath,(err) => {
        //     console.log(err);
        // });
    }
    broswerHistory.forEach((row) => {
        if(!row.visit_duration) row.visit_duration = 0;
        if(!row.rev_host) row.rev_host = "";
        else{
            let host = row.rev_host;
            host = host.toString();
            host = host.split('').reverse().join('') 
            host = host.slice(1,host.length)
            row.rev_host = host;
        }
        row.browser = browserName;
        //row.end_time = row.visit_time + row.visit_duration;
        row.visit_time = new Date(row.visit_time/1000)
        row.visit_time = moment(row.visit_time).format("MMMM Do YYYY, h:mm:ss a")
        //row.end_time = new Date(row.end_time)
        //row.end_time = moment(row.end_time).format("MMMM Do YYYY, h:mm:ss a")
    })
    return broswerHistory;
}

async function getSafariBasedRecords(paths, browserName, historyTime)
{
    let broswerHistory = [];
    let browser;
    historyTime.forEach((row) => {row  = (row/1000)-978307200 })
    //console.log(moment(historyTime[0]/1000).format("MMMM Do YYYY, h:mm:ss a"))
    for(let i=0;i<paths.length;i++)
    {
        console.log(1);
        let path = paths[i];
        let newPath = path + "i";
        await promises.copyFile(path,newPath).then(() => console.log("copied")).catch((err) => console.log(err))
        let url = `select DISTINCT url,visit_time FROM history_visits INNER JOIN history_items ON history_items.id  = history_visits.history_item WHERE visit_time > ${historyTime[0]} ORDER BY visit_time ASC`;
        browser = await getBrowserhistory(newPath,url,"params");
        broswerHistory.push(...browser)
        fs.unlink(newPath,(err) => {
            console.log(err);
        });
    }
    broswerHistory.forEach((row) => {
        if(!row.visit_duration) row.visit_duration = 0;
        if(!row.rev_host) row.rev_host = "";
        else{
            let host = row.rev_host;
            host = host.toString();
            host = host.split('').reverse().join('') 
            host = host.slice(1,host.length)
            row.rev_host = host;
        }
        row.browser = browserName;
        //row.end_time = row.visit_time + row.visit_duration;
        row.visit_time = new Date(row.visit_time+978307200)
        row.visit_time = moment(row.visit_time).format("MMMM Do YYYY, h:mm:ss a")
        //row.end_time = new Date(row.end_time)
        //row.end_time = moment(row.end_time).format("MMMM Do YYYY, h:mm:ss a")
    })
    return broswerHistory;
}





/**
 * Gets Chrome History
 * @param historyTimeLength time is in minutes
 * @returns {Promise<array>}
 */
async function getChromeHistory(historyTimeLength = 10) {
    historyTime = getWebkitTime(historyTimeLength)
    browsers.browserDbLocations.chrome = browsers.findPaths(browsers.defaultPaths.chrome, browsers.CHROME);
    return getChromeBrowserRecords(browsers.browserDbLocations.chrome, browsers.CHROME, historyTime).then(records => {
        return records;
    });
}

/**
 * Gets Chrome History
 * @param historyTimeLength time is in minutes
 * @returns {Promise<array>}
 */
async function getTorchHistory(historyTimeLength = 10) {
    historyTime = getWebkitTime(historyTimeLength)
    browsers.browserDbLocations.torch = browsers.findPaths(browsers.defaultPaths.torch, browsers.TORCH);
    return getChromeBrowserRecords(browsers.browserDbLocations.torch, browsers.TORCH, historyTime).then(records => {
        return records;
    });
}


/**
 * Gets Chrome History
 * @param historyTimeLength time is in minutes
 * @returns {Promise<array>}
 */
async function getBraveHistory(historyTimeLength = 10) {
    historyTime = getWebkitTime(historyTimeLength)
    browsers.browserDbLocations.brave = browsers.findPaths(browsers.defaultPaths.brave, browsers.BRAVE);
    return getChromeBrowserRecords(browsers.browserDbLocations.brave, browsers.BRAVE, historyTime).then(records => {
        return records;
    });
}

/**
 * Gets Chrome History
 * @param historyTimeLength time is in minutes
 * @returns {Promise<array>}
 */
async function getSafariHistory(historyTimeLength = 10) {
    historyTime = getWebkitTime_firefox(historyTimeLength)
    browsers.browserDbLocations.safari = browsers.findPaths(browsers.defaultPaths.safari, browsers.SAFARI);
    return getSafariBasedRecords(browsers.browserDbLocations.safari, browsers.SAFARI, historyTime).then(records => {
        return records;
    });
}

/**
 * Gets Chrome History
 * @param historyTimeLength time is in minutes
 * @returns {Promise<array>}
 */
async function getEdgeHistory(historyTimeLength = 10) {
    historyTime = getWebkitTime(historyTimeLength)
    browsers.browserDbLocations.edge = browsers.findPaths(browsers.defaultPaths.edge, browsers.EDGE);
    return getChromeBrowserRecords(browsers.browserDbLocations.edge, browsers.EDGE, historyTime).then(records => {
        return records;
    });
}

/**
 * Gets Chrome History
 * @param historyTimeLength time is in minutes
 * @returns {Promise<array>}
 */
async function getOperaHistory(historyTimeLength = 10) {
    historyTime = getWebkitTime(historyTimeLength)
    browsers.browserDbLocations.opera = browsers.findPaths(browsers.defaultPaths.opera, browsers.OPERA);
    return getChromeBrowserRecords(browsers.browserDbLocations.opera, browsers.OPERA, historyTime).then(records => {
        return records;
    });
}

/**
 * Gets Chrome History
 * @param historyTimeLength time is in minutes
 * @returns {Promise<array>}
 */
async function getFirefoxHistory(historyTimeLength = 10) {
    historyTime = getWebkitTime_firefox(historyTimeLength)
    browsers.browserDbLocations.firefox = browsers.findPaths(browsers.defaultPaths.firefox, browsers.FIREFOX);
    return getFirefoxBasedRecords(browsers.browserDbLocations.firefox, browsers.FIREFOX, historyTime).then(records => {
        return records;
    });
}
async function getSeaMonkey(historyTimeLength = 10) {
    browsers.browserDbLocations.seamonkey = browsers.findPaths(browsers.defaultPaths.seamonkey, browsers.SEAMONKEY);
    return getFirefoxBasedRecords(browsers.browserDbLocations.seamonkey, browsers.SEAMONKEY, historyTime).then(records => {
        return records;
    });
}

async function getAllHistory(historyTimeLength = 10) {
    historyTime = getWebkitTime(historyTimeLength)
    historyTime_fireFox = getWebkitTime_firefox(historyTimeLength);
    let allBrowserRecords = [];

    browsers.browserDbLocations.firefox = browsers.findPaths(browsers.defaultPaths.firefox, browsers.FIREFOX);
    browsers.browserDbLocations.chrome = browsers.findPaths(browsers.defaultPaths.chrome, browsers.CHROME);
    browsers.browserDbLocations.seamonkey = browsers.findPaths(browsers.defaultPaths.seamonkey, browsers.SEAMONKEY);
    browsers.browserDbLocations.opera = browsers.findPaths(browsers.defaultPaths.opera, browsers.OPERA);
    browsers.browserDbLocations.torch = browsers.findPaths(browsers.defaultPaths.torch, browsers.TORCH);
    browsers.browserDbLocations.brave = browsers.findPaths(browsers.defaultPaths.brave, browsers.BRAVE);
    browsers.browserDbLocations.safari = browsers.findPaths(browsers.defaultPaths.safari, browsers.SAFARI);
    browsers.browserDbLocations.seamonkey = browsers.findPaths(browsers.defaultPaths.seamonkey, browsers.SEAMONKEY);
    browsers.browserDbLocations.maxthon = browsers.findPaths(browsers.defaultPaths.maxthon, browsers.MAXTHON);
    browsers.browserDbLocations.vivaldi = browsers.findPaths(browsers.defaultPaths.vivaldi, browsers.VIVALDI);
    browsers.browserDbLocations.edge = browsers.findPaths(browsers.defaultPaths.edge, browsers.EDGE);

    allBrowserRecords = allBrowserRecords.concat(await getFirefoxBasedRecords(browsers.browserDbLocations.firefox, browsers.FIREFOX, historyTime_fireFox));
    allBrowserRecords = allBrowserRecords.concat(await getFirefoxBasedRecords(browsers.browserDbLocations.seamonkey, browsers.SEAMONKEY, historyTime_fireFox));
    allBrowserRecords = allBrowserRecords.concat(await getChromeBrowserRecords(browsers.browserDbLocations.chrome, browsers.CHROME, historyTime));
    allBrowserRecords = allBrowserRecords.concat(await getChromeBrowserRecords(browsers.browserDbLocations.opera, browsers.OPERA, historyTime));
    allBrowserRecords = allBrowserRecords.concat(await getChromeBrowserRecords(browsers.browserDbLocations.torch, browsers.TORCH, historyTime));
    allBrowserRecords = allBrowserRecords.concat(await getChromeBrowserRecords(browsers.browserDbLocations.brave, browsers.BRAVE, historyTime));
    allBrowserRecords = allBrowserRecords.concat(await getSafariBasedRecords(browsers.browserDbLocations.safari, browsers.SAFARI, historyTime_fireFox));
    //allBrowserRecords = allBrowserRecords.concat(await getBrowserHistory(browsers.browserDbLocations.vivaldi, browsers.VIVALDI, historyTime));
    //allBrowserRecords = allBrowserRecords.concat(await getBrowserHistory(browsers.browserDbLocations.maxthon, browsers.MAXTHON, historyTime));
    allBrowserRecords = allBrowserRecords.concat(await getChromeBrowserRecords(browsers.browserDbLocations.edge, browsers.EDGE, historyTime));
    //No Path because this is handled by the dll

    return allBrowserRecords;
}
getAllHistory(11).then((result) => { console.log(result)})

//console.log(moment().subtract(10,'minutes').calendar().format("MMMM Do YYYY, h:mm:ss a"));
