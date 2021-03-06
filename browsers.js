const path = require('path');
const fs = require('fs');

const CHROME = 'Google Chrome',
   FIREFOX   = 'Mozilla Firefox',
   TORCH     = 'Torch',
   OPERA     = 'Opera',
   SEAMONKEY = 'SeaMonkey',
   VIVALDI   = 'Vivaldi',
   SAFARI    = 'Safari',
   MAXTHON   = 'Maxthon',
   EDGE      = 'Microsoft Edge',
   BRAVE     = 'Brave';

let browserDbLocations = {
    chrome: "",
    firefox: "",
    opera: "",
    edge: "",
    torch: "",
    seamonkey: "",
    vivaldi: "",
    maxthon: "",
    safari: "",
    brave: "",
};


let defaultPaths = {
    chrome: "",
    firefox: "",
    opera: "",
    edge: "",
    torch: "",
    seamonkey: "",
    vivaldi: "",
    maxthon: "",
    safari: "",
    brave: "",
};

if (process.platform === "win32")
{
    let basePath = path.join(process.env.HOMEDRIVE, "Users", process.env['USERPROFILE'].split(path.sep)[2], "AppData");

    defaultPaths.chrome = path.join(basePath, "Local", "Google", "Chrome");
    defaultPaths.firefox = path.join(basePath, "Roaming", "Mozilla", "Firefox");
    defaultPaths.opera = path.join(basePath, "Roaming", "Opera Software");
    defaultPaths.edge = path.join(basePath, "Local", "Microsoft", "Edge");
    defaultPaths.torch = path.join(basePath, "Local", "Torch", "User Data");
    defaultPaths.seamonkey = path.join(basePath, "Roaming", "Mozilla", "SeaMonkey");
    defaultPaths.brave = path.join(basePath, "Local", "BraveSoftware");
    defaultPaths.safari = path.join(basePath,"Roaming","Apple Computer","Safari","PubSub","Database");
}
else if(process.platform === "darwin"){
    let homeDirectory = process.env.HOME;

    defaultPaths.chrome = path.join(homeDirectory, "Library", "Application Support", "Google", "Chrome");
    defaultPaths.firefox = path.join(homeDirectory, "Library", "Application Support", "Firefox");
    defaultPaths.edge = path.join(homeDirectory, "Library", "Application Support", "Microsoft Edge");
    defaultPaths.safari = path.join(homeDirectory, "Library", "Safari");
    defaultPaths.opera = path.join(homeDirectory, "Library", "Application Support", "com.operasoftware.Opera");
    defaultPaths.maxthon = path.join(homeDirectory, "Library", "Application Support", "com.maxthon.mac.Maxthon");
    defaultPaths.vivaldi = path.join(homeDirectory, "Library", "Application Support", "Vivaldi");
    defaultPaths.seamonkey = path.join(homeDirectory, "Library", "Application Support", "SeaMonkey", "Profiles");
    defaultPaths.brave = path.join(homeDirectory, "Library", "Application Support", "BraveSoftware", "Brave-Browser");
}

else if(process.platform === 'linux')
{
    let homeDirectory = process.env.HOME;

    defaultPaths.chrome = path.join(homeDirectory, ".config", "google-chrome");
    defaultPaths.edge = path.join(homeDirectory, ".config", "microsoft-edge");

    defaultPaths.firefox = path.join(homeDirectory,".mozilla","firefox");
    defaultPaths.opera = path.join(homeDirectory,".config","opera");
    defaultPaths.seamonkey = path.join(homeDirectory,".mozilla",'seamonkey')
    defaultPaths.brave = path.join(homeDirectory,'.config','BraveSoftware','Brave-Browser');


}



function findFilesInDir(startPath, filter,regExp = new RegExp(".*"), depth = 0) {
    if(depth === 4){
        return [];
    }
    
    let results = [];
    if (!fs.existsSync(startPath)) {
        //console.log("no dir ", startPath);
        return results;
    }

    let files = fs.readdirSync(startPath);
    for (let i = 0; i < files.length; i++) {
        let filename = path.join(startPath, files[i]);
        if (!fs.existsSync(filename)) {
            continue;
        }
        let stat = fs.lstatSync(filename);
        if (stat.isDirectory()) {
            results = results.concat(findFilesInDir(filename, filter, regExp, depth + 1)); //recurse
        } else if (regExp.test(filename)) {
            //console.log('-- found: ', filename);
            results.push(filename);
        }
    }
    return results;
}

function findPaths(path, browserName)
{
    switch (browserName)
    {
        case FIREFOX:
            return findFilesInDir(path, ".sqlite",/places.sqlite$/);
        case SEAMONKEY:
            return findFilesInDir(path, ".sqlite",/places.sqlite$/);
        case CHROME:
            return findFilesInDir(path,"History",/History$/)
        case TORCH: 
            return findFilesInDir(path,"History",/History$/)           
        case OPERA:
            return findFilesInDir(path,"History",/History$/)
        case BRAVE:
            return findFilesInDir(path,"History",/History$/)
        case VIVALDI:
        case EDGE:
            return findFilesInDir(path, "History",/History$/);
        case SAFARI:
            return findFilesInDir(path, ".db", /History\.db$/);
        case MAXTHON:
            return findFilesInDir(path, ".dat", /History\.dat$/);
        default:
            return [];
    }
}
module.exports = {
    findPaths,
    browserDbLocations,
    defaultPaths,
    CHROME,
    FIREFOX,
    TORCH,
    OPERA,
    SEAMONKEY,
    VIVALDI,
    SAFARI,
    MAXTHON,
    BRAVE,
    EDGE
};