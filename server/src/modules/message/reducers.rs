use crate::modules::message::models::message;
use crate::modules::message::models::Message;
use spacetimedb::ReducerContext;
use spacetimedb::Table;

fn validate_message(text: String) -> Result<String, String> {
    if text.is_empty() {
        Err("Messages must not be empty".to_string())
    } else {
        Ok(text)
    }
}

#[spacetimedb::reducer]
pub fn send_message(ctx: &ReducerContext, text: String) -> Result<(), String> {
    // Things to consider:
    // - Rate-limit messages per-user.
    // - Reject messages from unnamed user.
    let text = validate_message(text)?;
    ctx.db.message().insert(Message {
        sender: ctx.sender,
        text,
        sent: ctx.timestamp,
    });
    Ok(())
}
