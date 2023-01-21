const {BrowserWindow, app} = require("electron");
const path = require("path");

const createWindow = () => {
    const win = new BrowserWindow({
        width: 960,
        height: 600,
        useContentSize: true,
        // resizable: false,
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        }
    });
    win.loadFile("FNGplot.html");
    console.log(win.getContentSize(), win.getBounds());
}

app.whenReady().then( () => {
    createWindow();
});

app.on("window-all-closed", () => { // Special case for MacOS
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});