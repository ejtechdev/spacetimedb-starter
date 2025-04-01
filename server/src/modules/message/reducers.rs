//! Contains reducers related to chat messages.
use crate::modules::message::models::{message, Message};
use spacetimedb::{ReducerContext, Table};

/// Validates the message text.
/// Ensures messages are not empty.
///
/// # Arguments
/// * `text` - The message text to validate.
///
/// # Returns
/// * `Ok(String)` if the text is valid.
/// * `Err(String)` with an error message if validation fails.
fn validate_message(text: String) -> Result<String, String> {
    if text.is_empty() {
        Err("Messages must not be empty".to_string())
    } else {
        // Potential future validation: length limits, profanity filter
        Ok(text)
    }
}

/// Reducer to send a new chat message.
/// Validates the message text and inserts it into the `Message` table.
///
/// # Arguments
/// * `ctx` - The reducer context, providing sender identity and timestamp.
/// * `text` - The content of the message to send.
///
/// # Returns
/// * `Ok(())` on successful message insertion.
/// * `Err(String)` if message validation fails.
#[spacetimedb::reducer]
pub fn send_message(ctx: &ReducerContext, text: String) -> Result<(), String> {
    // Things to consider adding in the future:
    // - Rate-limit messages per-user.
    // - Reject messages from unnamed users (check User table).
    // - Update user's last_active timestamp.
    let text = validate_message(text)?;
    ctx.db.message().insert(Message {
        sender: ctx.sender,
        text,
        sent: ctx.timestamp, // Use the server timestamp when the reducer is called
    });
    Ok(())
}
