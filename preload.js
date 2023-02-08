const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld(
    "fileIPC",
    {
        loadEditPanels: () => { return ipcRenderer.invoke('load-editpanels') }
    }
)