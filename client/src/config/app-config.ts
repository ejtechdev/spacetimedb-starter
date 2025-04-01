/**
 * Application configuration constants
 */

export const Config = {
  // SpacetimeDB connection settings
  spacetimeDB: {
    host: import.meta.env.PROD
      ? "wss://maincloud.spacetimedb.com"
      : "ws://localhost:3000",
    moduleName: "spacetime-starter",
  },
};
