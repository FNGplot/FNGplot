const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld(
    "electronIPC",
    {
        // files
        loadEditPanels: () => ipcRenderer.invoke("load-editpanels"),
        //system
        changeWindowSize: (sizeObj) => ipcRenderer.send("change-widnow-size", sizeObj),
        quitApp: () => ipcRenderer.send("quit-app")
    }
)