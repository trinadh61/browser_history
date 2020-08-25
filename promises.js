const sqlite = require('sqlite3').verbose();
const fs = require('fs');
const { resolve } = require('path');

let db;
exports.db = db;
exports.open = function(path)
{
    return new Promise((resolve,reject) => 
    {
        this.db = new sqlite.Database(path,(err) => 
        {
            if(!err) resolve(path + " connected")
            else reject(err.message)
        })
    })
}

exports.all = function(url,params)
{
    return new Promise((resolve,reject)=>{
        this.db.all(url,(err,rows) => {
            if(err) reject(err.message)
            else resolve(rows)
        })
    })
}
exports.copyFile = function(path,newPath)
{
    return new Promise((resolve,reject) => {
        fs.copyFile(path,newPath,(err) => {
            if(err) reject("Copying error: "+err.message);
            else resolve("sgfb");
        })
    })
}
exports.close = function()
{
    return new Promise((resolve,reject)  => {
        this.db.close()
        resolve("true")
    })
}

