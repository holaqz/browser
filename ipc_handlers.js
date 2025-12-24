const { ipcMain } = require('electron');

const appState = {
    events: [],
    inactiveTime: null,
    trackingEnabled: true
};

ipcMain.on('cursor-left', (_, data) => {
    if (!data || !appState.trackingEnabled) return;
    data.timestamp = Number(data.timestamp);
    appState.events.push(data);
    console.log(`Cursor left: ${new Date(data.timestamp).toLocaleString()}`);
});

ipcMain.on('cursor-returned', (_, data) => {
    if (!data || data.duration === undefined || !appState.trackingEnabled) return;
    data.timestamp = Number(data.timestamp);
    appState.events.push(data);
    console.log(`Cursor returned: ${new Date(data.timestamp).toLocaleString()}`);
    console.log(`Away for: ${Number(data.duration).toFixed(2)}s`);
});

ipcMain.on('tracking-state-changed', (_, data) => {
    if (!data) return;

    appState.trackingEnabled = data.enabled;
    data.timestamp = Number(data.timestamp);
    data.type = 'tracking_state_changed';

    appState.events.push(data);
    console.log(`Tracking ${data.enabled ? 'ENABLED' : 'DISABLED'}: ${new Date(data.timestamp).toLocaleString()}`);

    if (!appState.trackingEnabled) {
        appState.inactiveTime = null;
    }
});


ipcMain.on('inactive', (_, data) => {
    if (!data || !appState.trackingEnabled) return;
    data.timestamp = Number(data.timestamp);
    appState.events.push(data);
    console.log(`Window inactive: ${new Date(data.timestamp).toLocaleString()}`);
});

ipcMain.on('active', (_, data) => {
    if (!data || data.duration === undefined || !appState.trackingEnabled) return;
    data.timestamp = Number(data.timestamp);
    appState.events.push(data);
    console.log(`Window active: ${new Date(data.timestamp).toLocaleString()}`);
    console.log(`Duration: ${Number(data.duration).toFixed(2)}s`);
});

ipcMain.on('get-session-events', (event) => {
    const sessionEvents = appState.events.filter(e =>
        e.type === 'inactive' ||
        e.type === 'active' ||
        e.type === 'cursor_left' ||
        e.type === 'cursor_returned' ||
        e.type === 'tracking_state_changed'
    );
    event.reply('get-session-events-response', sessionEvents);
});

ipcMain.on('get-events-last-minutes', (event, data) => {
    if (!data || !data.minutes) return;

    const minutesAgo = Date.now() - (data.minutes * 60 * 1000);
    const recentEvents = appState.events.filter(e =>
        e.timestamp >= minutesAgo
    );

    event.reply('get-events-last-minutes-response', recentEvents);
});

module.exports = { appState };
