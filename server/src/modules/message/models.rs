//! Defines the data model for chat messages.

use spacetimedb::{Identity, Timestamp};
use crate::modules::message::types::ReactionEmoji;

/// Represents a single chat message in the database.
#[spacetimedb::table(name = message, public)] // Name defaults to struct name, 'public' visibility assumed
// Extend the Message table to add an ID
pub struct Message {
    #[primary_key]
    #[auto_inc] // Auto-incremented message ID
    pub message_id: u64,
    /// The identity of the user who sent the message.
    pub sender: Identity,
    /// The server timestamp when the message was received.
    pub sent: Timestamp,
    /// The text content of the message.
    pub text: String,
}

// Add the Reaction table

/// Represents an emoji reaction to a chat message.
#[spacetimedb::table(name = reaction, public)]
pub struct Reaction {
    #[primary_key]
    #[auto_inc] // Auto-incremented reaction ID
    pub reaction_id: u64,
    // The ID of the message that was reacted to
    pub message_id: u64,
    // The emoji that was reacted to the message
    pub emoji: ReactionEmoji,
    // The identity of the user who reacted to the message
    pub reactor: Identity,
    // The server timestamp when the reaction was received
    pub reacted_at: Timestamp,
}
