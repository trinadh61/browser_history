const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const browsers = require("./browsers");

function fromDb(path,url,broswerHistory)
{
    let db = new sqlite3.Database(path,(err) =>{
        if(err)
        console.error(err.message);
    })
    db.all(url,(err,rows) => {
        if(err) console.error(err.message)
        else{
            rows.forEach((row) => broswerHistory.push({url:row.url,visit:row.visit_time}))
        }
    })
    db.close();
}


function getChromeBrowserRecords(paths, browserName,historyName,broswerHistory1)
{
    for(let i=0;i<paths.length;i++)
    {
        let path = paths[i];
        let newPath = path+"3";
        fs.unlink(newPath,(err) => {
            console.log(err);
        });
        fs.copyFile(path,newPath,(err) => {
            if(!err)
            console.log("copping Successfull")
        });

        let url = "SELECT urls.url, visit_time, visit_duration FROM "
        +"visits INNER JOIN urls on urls.id = visits.url;";
        setTimeout(() => fromDb(newPath,url,broswerHistory1), 2000);
    }
}
function getEdgeBAsedRecords(paths, browserName,historyName,broswerHistory1)
{
    for(let i=0;i<paths.length;i++)
    {
        let path = paths[i];
        let newPath = path+"3";
        fs.unlink(newPath,(err) => {
            console.log(err);
        });
        fs.copyFile(path,newPath,(err) => {
            if(!err)
            console.log("copping Successfull")
        });

        let url = "SELECT urls.url, visit_time, visit_duration FROM "
        +"visits INNER JOIN urls on urls.id = visits.url;";
        setTimeout(() => fromDb(newPath,url,broswerHistory1), 2000);
    }
}

function getFirefoxBAsedRecords(paths, browserName,historyName,broswerHistory1)
{
    for(let i=0;i<paths.length;i++)
    {
        let path = paths[i];
        // fs.unlink(newPath,(err) => {
        //     console.log(err);
        // });
        // fs.copyFile(path,newPath,(err) => {
        //     if(!err)
        //     console.log("copping Successfull")
        // });

        let url = "select url,last_visit_date as visit_date,rev_host from moz_places;";
        fromDb(path,url,broswerHistory1)
    }
}

let broswerHistory1 = [];
//getFirefoxBAsedRecords(browsers.findPaths(browsers.defaultPaths.firefox,browsers.FIREFOX),'hromw',10,broswerHistory1)
getChromeBrowserRecords(browsers.findPaths(browsers.defaultPaths.chrome,browsers.CHROME),'hromw',10,broswerHistory1)
getEdgeBAsedRecords(browsers.findPaths(browsers.defaultPaths.edge,browsers.EDGE),'hromw',10,broswerHistory1)
setTimeout(() => {
    console.log(broswerHistory1.length)
}, 10000);
