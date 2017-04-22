'use strict';

const {BrowserWindow} = require('electron');
const windowState     = require('electron-window-state');
const _               = require('underscore');

/**
 * Window manager.
 *
 * @class
 * @license MPL-2.0
 */
class WindowManager {

    constructor(iconPath) {
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
            width           : this.state.width,
            height          : this.state.height,
            minWidth        : 370,
            minHeight       : 520,
            x               : this.state.x,
            y               : this.state.y,
            title           : 'Laverna',
            icon            : iconPath,
            autoHideMenuBar : true,
            backgroundColor : '#00a693',
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

        this.win.loadURL('http://localhost:9000');
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