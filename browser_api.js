let initializationAttempts = 0;
const maxAttempts = 50;

function initializeBrowserAPI() {
    if (window.browserAPI && typeof window.browserAPI.send === 'function') {
        window.Browser = {
    enableTracking: () => {
        if (!window.browserAPI || typeof window.browserAPI.send !== 'function') {
            console.error('browserAPI is not available');
            return;
        }

        window.Browser._trackingEnabled = true;
        window.browserAPI.send('tracking-state-changed', {
            enabled: true,
            timestamp: Date.now()
        });
        console.log('Tracking enabled');
    },

    disableTracking: () => {
        if (!window.browserAPI || typeof window.browserAPI.send !== 'function') {
            console.error('browserAPI is not available');
            return;
        }

        window.Browser._trackingEnabled = false;
        window.browserAPI.send('tracking-state-changed', {
            enabled: false,
            timestamp: Date.now()
        });
        console.log('Tracking disabled');
    },

    _trackingEnabled: true,

    getTrackingState: () => {
        console.log(`Tracking: ${window.Browser._trackingEnabled ? 'on' : 'off'}`);
        return window.Browser._trackingEnabled;
    },

    _updateTrackingState: (enabled) => {
        window.Browser._trackingEnabled = enabled;
    },

    getSessionEvents: () => {
        return new Promise((resolve, reject) => {
            if (!window.browserAPI || typeof window.browserAPI.onResponse !== 'function') {
                reject(new Error('browserAPI is not available'));
                return;
            }

            window.browserAPI.onResponse('get-session-events-response', (events) => {
                console.log('count of events:', events.length);
                resolve(events);
            });
            window.browserAPI.send('get-session-events');
        });
    },

    getStats: async () => {
        try {
            const events = await window.Browser.getSessionEvents();

            const stats = {
                totalEvents: events.length,
                cursorLeft: events.filter(e => e.type === 'cursor_left').length,
                cursorReturned: events.filter(e => e.type === 'cursor_returned').length,
                inactive: events.filter(e => e.type === 'inactive').length,
                active: events.filter(e => e.type === 'active').length,
                trackingChanges: events.filter(e => e.type === 'tracking_state_changed').length
            };

            console.log('stats:', stats);
            return stats;
        } catch (error) {
            console.error('Error getting stats:', error);
            throw error;
        }
    },

    getEventsLastMinutes: (minutes) => {
        return new Promise((resolve, reject) => {
            if (!window.browserAPI || typeof window.browserAPI.onResponse !== 'function') {
                reject(new Error('browserAPI is not available'));
                return;
            }

            window.browserAPI.onResponse('get-events-last-minutes-response', (events) => {
                console.log(`События за последние ${minutes} минут:`, events.length);
                resolve(events);
            });
            window.browserAPI.send('get-events-last-minutes', {
                minutes: minutes,
                timestamp: Date.now()
            });
        });
    }
};
    } else {
        setTimeout(initializeBrowserAPI, 100);
    }
}

initializeBrowserAPI(); 
