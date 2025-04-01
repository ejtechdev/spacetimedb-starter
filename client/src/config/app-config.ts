/**
 * @fileoverview Application environment configuration constants.
 */

/**
 * Configuration settings that may differ between development and production environments.
 */
export const Config = {
  /** SpacetimeDB connection settings */
  spacetimeDB: {
    /** The host URL for the SpacetimeDB instance. */
    host: import.meta.env.PROD
      ? "wss://maincloud.spacetimedb.com"
      : "ws://localhost:3000",
    /** The name of the SpacetimeDB module to connect to. */
    moduleName: "spacetime-starter",
  },
};
