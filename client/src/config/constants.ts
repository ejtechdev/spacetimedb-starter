/**
 * @fileoverview Application-wide constants that do not change based on environment.
 */

/**
 * Collection of fixed constants used throughout the application.
 */
export const Constants = {
  /** UI text labels */
  textLabels: {
    /** Text shown while connecting. */
    connecting: "Connecting...",
    /** Text shown when connected. */
    connected: "Connected",
    /** Text shown when disconnected. */
    disconnected: "Disconnected",
    /** Prefix for error messages. */
    errorPrefix: "Error: ",
  },

  /** Time constants in milliseconds */
  time: {
    /** Default duration for CSS animations/transitions. */
    animationDuration: 300,
  },

  /** Identity display settings */
  identity: {
    /** Number of characters to display for a shortened identity hex string. */
    shortLength: 6,
  },
};
