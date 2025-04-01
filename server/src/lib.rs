// Define the module structure
pub mod modules;

// Re-export specific items that should be part of the public API
// This is more selective than glob imports (*)
pub use modules::user::{models::User, reducers::{move_player, set_name}};
pub use modules::message::{models::Message, reducers::send_message};
pub use modules::scheduler::reducers::init;
