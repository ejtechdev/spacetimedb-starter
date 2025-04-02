//! Contains reducers related to chat messages.
use crate::modules::message::models::{message, Message, reaction, Reaction};
use crate::modules::message::types::ReactionEmoji;
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
        message_id: 0,
        sender: ctx.sender,
        text,
        sent: ctx.timestamp, // Use the server timestamp when the reducer is called
    });
    Ok(())
}

/// Reducer to toggle an emoji reaction on a message.
///
/// # Arguments
/// * `ctx` - The reducer context, providing sender identity and timestamp.
/// * `message_id` - The ID of the message to react to.
/// * `emoji` - The emoji to react with.
///
/// # Returns
/// * `Ok(())` on successful reaction insertion.
#[spacetimedb::reducer]
pub fn toggle_reaction(
    ctx: &ReducerContext,
    message_id: u64,
    emoji: ReactionEmoji
) -> Result<(), String> {
    let reactor = ctx.sender;

    if let Some(existing_reaction) = ctx.db.reaction().iter().find(|r| {
        r.message_id == message_id && r.reactor == reactor && r.emoji.to_emoji() == emoji.to_emoji()
    }) {
        ctx.db.reaction().reaction_id().delete(&existing_reaction.reaction_id);
    } else {
        ctx.db.reaction().insert(Reaction {
            reaction_id: 0,
            message_id,
            emoji,
            reactor,
            reacted_at: ctx.timestamp,
        });
    }

    Ok(())
}