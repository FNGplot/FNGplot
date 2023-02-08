const {BrowserWindow, app, ipcMain} = require("electron");
const path = require("path");
const fsp = require("fs").promises; // promisified "fs"

const createWindow = () => {
    const win = new BrowserWindow({
        width: 1120,
        height: 600,
        useContentSize: true,
        resizable: false,
        autoHideMenuBar: true,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            preload: path.join(__dirname, "preload.js")
        }
    });
    win.loadFile("FNGplot.html");
    console.log(win.getContentSize(), win.getBounds());
}

app.whenReady().then(() => {
    ipcMain.handle("load-editpanels", handleEditPanelLoad);
    createWindow();
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

app.on("window-all-closed", () => { // Special case for MacOS
    if (process.platform !== "darwin") {
        app.quit();
    }
});


/* [!] Low-level functions (2-way IPC) */

async function handleEditPanelLoad() {
    try {
        const rawData = await fsp.readFile('res/system/editpanel/editpanels.json');
        const data = rawData.toString();
        return {success: true, content: data}
    } catch (error) {
        return {success: false, content: null}
    }
}

/* [!] Low-level functions (1-way IPC) */

ipcMain.on("quit-app", () => app.quit());
ipcMain.on("change-windowsize", (event, sizeObj) => {
    const webContents = event.sender;
    const win = BrowserWindow.fromWebContents(webContents);
    win.setContentSize(sizeObj.width, sizeObj.height);  // Window will resize automatically to match content size (window's "useContentSize" was set to true)
});