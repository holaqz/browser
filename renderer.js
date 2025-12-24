let cursorLeftTime = null;
let inactiveTime = null;
let trackingEnabled = true;

function updateTrackingState(enabled) {
    trackingEnabled = enabled;
}

if (window.browserAPI && typeof window.browserAPI.onResponseAlways === 'function') {
    window.browserAPI.onResponseAlways('tracking-state-changed', (data) => {
        if (data.enabled !== undefined) {
            updateTrackingState(data.enabled);
        }
    });
} else {
    console.error('browserAPI is not available in renderer.js');
}

function checkWindowActivity() {
    if (!trackingEnabled) return;

    const isFocused = document.hasFocus();
    const isVisible = !document.hidden;
    const isActive = isFocused && isVisible;

    if (!isActive && !inactiveTime) {
        inactiveTime = Date.now();
        window.browserAPI.send('inactive', {
            timestamp: inactiveTime,
            type: 'inactive',
            trackingState: 'enabled'
        });
    }

    if (isActive && inactiveTime) {
        const activeTime = Date.now();
        const duration = (activeTime - inactiveTime) / 1000;
        window.browserAPI.send('active', {
            timestamp: activeTime,
            type: 'active',
            duration: duration,
            trackingState: 'enabled'
        });
        inactiveTime = null;
    }
}

setInterval(checkWindowActivity, 100);

document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener("mouseout", function(e) {
        if (!trackingEnabled || !window.browserAPI || typeof window.browserAPI.send !== 'function') return;

        const from = e.relatedTarget || e.toElement;
        if ((!from || from.nodeName == "HTML") && !cursorLeftTime) {
            cursorLeftTime = Date.now();
            window.browserAPI.send('cursor-left', {
                timestamp: cursorLeftTime,
                type: 'cursor_left'
            });
        }
    });

    document.addEventListener("mouseover", function() {
        if (!trackingEnabled || !window.browserAPI || typeof window.browserAPI.send !== 'function') return;

        if (cursorLeftTime) {
            const returnedTime = Date.now();
            const duration = (returnedTime - cursorLeftTime) / 1000;
            window.browserAPI.send('cursor-returned', {
                timestamp: returnedTime,
                type: 'cursor_returned',
                duration: duration
            });
            cursorLeftTime = null;
        }
    });

    document.getElementById('close-btn')?.addEventListener('click', () => {
        if (typeof window.close === 'function') {
            window.close();
        }
    });
});