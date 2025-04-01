//! Main library entry point for the SpacetimeDB chat server module.
//! Defines the database schema and registers reducers.

// Define the module structure
pub mod modules;

// Re-export specific items that should be part of the public API
// This is more selective than glob imports (*)
pub use modules::user::{models::User, reducers::set_name};
pub use modules::message::{models::Message, reducers::send_message};
pub use modules::scheduler::reducers::init;
