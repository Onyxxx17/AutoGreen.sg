/**
 * AutoGreen.sg Extension - Logger Module
 * 
 * Enhanced logger utility with configurable levels and formatting
 * 
 * @author AutoGreen Team
 * @version 1.0.0
 */

/**
 * Enhanced logger utility with configurable levels
 */
const AutoGreenLogger = {
  _config: null,
  
  _getConfig() {
    if (!this._config && typeof window !== 'undefined' && window.AutoGreenConfig) {
      this._config = window.AutoGreenConfig;
    }
    return this._config;
  },
  
  _shouldLog(level) {
    const config = this._getConfig();
    if (!config || !config.LOGGING.ENABLED) return false;
    
    const levels = ['debug', 'info', 'warn', 'error'];
    const configLevel = config.LOGGING.LEVEL || 'info';
    const currentLevelIndex = levels.indexOf(level);
    const configLevelIndex = levels.indexOf(configLevel);
    
    return currentLevelIndex >= configLevelIndex;
  },
  
  _getPrefix() {
    const config = this._getConfig();
    return config?.LOGGING.PREFIX || '[AutoGreen]';
  },

  _formatMessage(level, message, ...args) {
    const timestamp = new Date().toISOString().substr(11, 12);
    const prefix = this._getPrefix();
    const levelTag = level.toUpperCase();
    return `${prefix} [${timestamp}] [${levelTag}] ${message}`;
  },

  debug: function(message, ...args) {
    if (this._shouldLog('debug')) {
      console.debug(this._formatMessage('debug', message), ...args);
    }
  },

  log: function(message, ...args) {
    if (this._shouldLog('info')) {
      console.log(this._formatMessage('info', message), ...args);
    }
  },

  info: function(message, ...args) {
    if (this._shouldLog('info')) {
      console.info(this._formatMessage('info', message), ...args);
    }
  },

  warn: function(message, ...args) {
    if (this._shouldLog('warn')) {
      console.warn(this._formatMessage('warn', message), ...args);
    }
  },

  error: function(message, ...args) {
    if (this._shouldLog('error')) {
      console.error(this._formatMessage('error', message), ...args);
    }
  },

  /**
   * Group related log messages together
   */
  group: function(name, collapsed = false) {
    if (this._shouldLog('info')) {
      if (collapsed) {
        console.groupCollapsed(this._formatMessage('info', name));
      } else {
        console.group(this._formatMessage('info', name));
      }
    }
  },

  groupEnd: function() {
    if (this._shouldLog('info')) {
      console.groupEnd();
    }
  },

  /**
   * Log performance metrics
   */
  perf: function(name, duration) {
    if (this._shouldLog('debug')) {
      this.debug(`Performance [${name}]: ${duration.toFixed(2)}ms`);
    }
  },

  /**
   * Log with table formatting for complex data
   */
  table: function(data, columns) {
    if (this._shouldLog('debug')) {
      console.table(data, columns);
    }
  },
};

// Make Logger available globally
if (typeof window !== 'undefined') {
  window.AutoGreenLogger = AutoGreenLogger;
}
