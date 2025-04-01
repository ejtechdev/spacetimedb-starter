//! Defines the data model for users.

use spacetimedb::{Identity, Timestamp};

/// Represents a user connected to the application.
#[spacetimedb::table(name = user, public)]
pub struct User {
    /// Unique identifier for the user, provided by SpacetimeDB.
    #[primary_key]
    pub identity: Identity,
    /// Optional display name set by the user.
    pub name: Option<String>,
    /// Flag indicating if the user is currently connected.
    pub online: bool,
    /// Timestamp of the user's last activity (e.g., connection, message).
    pub last_active: Timestamp,
}
