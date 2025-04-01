//! Defines the data model for chat messages.

use spacetimedb::{Identity, Timestamp};

/// Represents a single chat message in the database.
#[spacetimedb::table(name = message, public)] // Name defaults to struct name, 'public' visibility assumed
pub struct Message {
    /// The identity of the user who sent the message.
    pub sender: Identity,
    /// The server timestamp when the message was received.
    pub sent: Timestamp,
    /// The text content of the message.
    pub text: String,
}
