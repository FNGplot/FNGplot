const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld(
    "fileIPC",
    {
        loadEditPanels: () => ipcRenderer.invoke('load-editpanels')
    }
)