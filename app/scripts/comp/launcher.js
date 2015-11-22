'use strict';

var Backbone = require('backbone');
var Launcher;

if (window.process && window.process.versions && window.process.versions.electron) {
    /* jshint node:true */
    Launcher = {
        name: 'electron',
        version: window.process.versions.electron,
        req: window.require,
        remReq: function(mod) {
            return this.req('remote').require(mod);
        },
        openLink: function(href) {
            this.req('shell').openExternal(href);
        },
        devTools: true,
        openDevTools: function() {
            this.req('remote').getCurrentWindow().openDevTools();
        },
        getAppVersion: function() {
            return this.remReq('app').getVersion();
        },
        getSaveFileName: function(defaultPath, cb) {
            if (defaultPath) {
                var homePath = this.remReq('app').getPath('userDesktop');
                defaultPath = this.req('path').join(homePath, defaultPath);
            }
            this.remReq('dialog').showSaveDialog({
                title: 'Save Passwords Database',
                defaultPath: defaultPath,
                filters: [{ name: 'KeePass files', extensions: ['kdbx'] }]
            }, cb);
        },
        getUserDataPath: function(fileName) {
            return this.req('path').join(this.remReq('app').getPath('userData'), fileName || '');
        },
        getTempPath: function(fileName) {
            return this.req('path').join(this.remReq('app').getPath('temp'), fileName || '');
        },
        writeFile: function(path, data) {
            this.req('fs').writeFileSync(path, new window.Buffer(data));
        },
        readFile: function(path, encoding) {
            var contents = this.req('fs').readFileSync(path, encoding);
            return typeof contents === 'string' ? contents : new Uint8Array(contents);
        },
        fileExists: function(path) {
            return this.req('fs').existsSync(path);
        },
        preventExit: function(e) {
            e.returnValue = false;
            return false;
        },
        exit: function() {
            Launcher.exitRequested = true;
            this.requestExit();
        },
        requestExit: function() {
            var app = this.remReq('app');
            if (this.restartPending) {
                app.quitAndRestart();
            } else {
                app.quit();
            }
        },
        requestRestart: function() {
            this.restartPending = true;
            this.requestExit();
        },
        cancelRestart: function() {
            this.restartPending = false;
        },
        getClipboardText: function() {
            return this.req('clipboard').readText();
        },
        clearClipboardText: function() {
            return this.req('clipboard').clear();
        },
        minimizeApp: function() {
            this.remReq('app').minimizeApp();
        },
        canMinimize: function() {
            return process.platform === 'win32';
        }
    };
    window.launcherOpen = function(path) {
        Backbone.trigger('launcher-open-file', path);
    };
    if (window.launcherOpenedFile) {
        console.log('Open file request', window.launcherOpenedFile);
        Backbone.trigger('launcher-open-file', window.launcherOpenedFile);
        delete window.launcherOpenedFile;
    }
}

module.exports = Launcher;