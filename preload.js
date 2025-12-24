const { contextBridge, ipcRenderer } = require('electron');

const validChannels = new Set([
    'cursor-left',
    'cursor-returned',
    'tracking-state-changed',
    'inactive',
    'active',
    'get-session-events',
    'get-session-events-response',
    'get-events-last-minutes',
    'get-events-last-minutes-response'
]);

contextBridge.exposeInMainWorld('browserAPI', {
    send: (channel, data) => {
        if (validChannels.has(channel)) {
            ipcRenderer.send(channel, data);
        } else {
            console.warn(`Попытка отправить в недопустимый канал: ${channel}`);
        }
    },

    onResponse: (channel, callback) => {
        ipcRenderer.once(channel, (_, data) => callback(data));
    },

    onResponseAlways: (channel, callback) => {
        return ipcRenderer.on(channel, (_, data) => callback(data));
    },

    getValidChannels: () => Array.from(validChannels)
});