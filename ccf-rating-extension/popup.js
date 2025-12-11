document.addEventListener('DOMContentLoaded', () => {
    const defaults = {
        showTag: true,
        showUnrecognized: true,
        enableRemoteUpdate: false,
        remoteUrl: 'https://gitee.com/jpjsqdy/ccf-data/raw/master/ccf_sci_data.json',
        debug: false
    };

    // Load settings
    chrome.storage.local.get(['ccf_config'], (result) => {
        const cfg = Object.assign({}, defaults, result.ccf_config || {});

        document.getElementById('showTag').checked = cfg.showTag;
        document.getElementById('showUnrecognized').checked = cfg.showUnrecognized;
        document.getElementById('enableRemoteUpdate').checked = cfg.enableRemoteUpdate;
        document.getElementById('remoteUrl').value = cfg.remoteUrl;
        document.getElementById('debug').checked = cfg.debug;
    });

    // Save settings
    document.getElementById('saveBtn').addEventListener('click', () => {
        const newCfg = {
            showTag: document.getElementById('showTag').checked,
            showUnrecognized: document.getElementById('showUnrecognized').checked,
            enableRemoteUpdate: document.getElementById('enableRemoteUpdate').checked,
            remoteUrl: document.getElementById('remoteUrl').value.trim(),
            debug: document.getElementById('debug').checked
        };

        chrome.storage.local.set({ 'ccf_config': newCfg }, () => {
            const status = document.getElementById('status');
            status.textContent = 'Settings saved.';
            setTimeout(() => {
                status.textContent = '';
            }, 2000);

            // Reload active tab to apply changes immediately
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    chrome.tabs.reload(tabs[0].id);
                }
            });
        });
    });
});
