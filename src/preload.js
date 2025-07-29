const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');

let dht;
(async () => {
  dht = await import('./scripts/dht.mjs');
})();

contextBridge.exposeInMainWorld('api', {
  suggestModels: () => ipcRenderer.invoke('suggest-models'),
  startModel: (modelId) => ipcRenderer.invoke('start-model-server', modelId)
});

contextBridge.exposeInMainWorld('dht', {
 startNode:()=>ipcRenderer.invoke('dht-start-node'),
 registerModel: (model, addr) => ipcRenderer.invoke('dht-register', model, addr),
 findModelNode: (model) => ipcRenderer.invoke('dht-find-model-node', model)
});
