const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld(
    "fileIPC",
    {
        loadEditPanels: () => ipcRenderer.send('load-editpanels')
    }
)