//! Module containing logic related to users (identity, name, presence).

// Module declarations
pub mod models;
pub mod reducers;

// Selective re-exports from this module
pub use models::User;
pub use reducers::{identity_connected, identity_disconnected, set_name};
