const {BrowserWindow, app, ipcMain} = require("electron");
const path = require("path");

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


/* [!] Low-level functions (IPC) */

async function handleEditPanelLoad(){
    return "testing, testing!";
}