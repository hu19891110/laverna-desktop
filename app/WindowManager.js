'use strict';

const {
    BrowserWindow,
    shell,
} = require('electron');

const windowState = require('electron-window-state');
const _           = require('underscore');
const path        = require('path');

/**
 * Window manager.
 *
 * @class
 * @license MPL-2.0
 */
class WindowManager {

    constructor(iconPath) {
        /**
         * URLs which are allowed to be opened in Laverna.
         *
         * @prop {Array}
         */
        this.allowedURLs = [
            'http://localhost:9000',
            'file:///${__dirname}/dist',
        ];

        /**
         * The previous state of the browser window (width, height, x&y pos)
         *
         * @prop {Object}
         */
        this.state = windowState('main', {
            width  : 1000,
            height : 600,
        });

        /**
         * Browser window options.
         *
         * @prop {Object}
         */
        this.options = {
            width               : this.state.width,
            height              : this.state.height,
            minWidth            : 370,
            minHeight           : 520,
            x                   : this.state.x,
            y                   : this.state.y,
            title               : 'Laverna',
            icon                : iconPath,
            autoHideMenuBar     : true,
            backgroundColor     : '#00a693',
            webPreferences      : {
                contextIsolation: true,
                nodeIntegration : false,
            },
        };
    }

    /**
     * Create the main browser window.
     */
    createMain(options) {
        /**
         * The main browser window.
         *
         * @prop {Object}
         */
        this.win = new BrowserWindow(_.extend({}, this.options, {
            webPreferences      : {
                nodeIntegration : false,
                preload         : path.resolve(path.join(__dirname, 'preload.js')),
            },
        }));

        if (this.state.isMaximized) {
            this.win.maximize();
        }

        // Show developer tools
        if (options.dev) {
            this.win.webContents.openDevTools();
        }

        // Auto-hide to tray
        if (options.tray) {
            this.win.hide();
        }

        // If it's dev environment, don't load the local files
        if (options.dev) {
            this.win.loadURL('http://localhost:9000');
        }
        else {
            this.win.loadURL(`file:///${__dirname}/dist/index.html`);
        }
    }

    /**
     * Listen to events triggered by the main window.
     */
    listenToMain() {
        this.win.webContents.on('will-navigate', this.handleURL.bind(this));
        this.win.webContents.on('new-window', this.handleURL.bind(this));
    }

    /**
     * Emit an event to the main window and show the window.
     *
     * @param {String} e
     */
    sendShow(e) {
        this.win.show();
        this.win.send(e);
    }

    /**
     * Open an URL in an external application.
     *
     * @param {Object} e
     * @param {String} url
     */
    handleURL(e, url) {
        let isAllowed = false;
        this.allowedURLs.forEach(allowed => {
            if (url.search(allowed) !== -1) {
                isAllowed = true;
            }
        });

        if (!isAllowed && url.search(/^blob:/) === -1) {
            e.preventDefault();
            shell.openExternal(url);
        }
    }

    /**
     * Hide or show the main window.
     */
    toggleShow() {
        if (this.win.isVisible()) {
            return this.win.hide();
        }

        this.win.show();
    }

    /**
     * Focus on the main window.
     */
    focusMain() {
        if (this.win.isMinimized()) {
            this.win.restore();
        }

        this.win.focus();
    }

    /**
     * Called before the app is closed.
     */
    onBeforeAppQuit() {
        // Save the window state (width, height...)
        if (this.win) {
            this.state.saveState(this.win);
            this.win = null;
        }
    }

}

module.exports = WindowManager;
