use spacetimedb::{Identity, ReducerContext, ScheduleAt, Table, Timestamp, TimeDuration};

#[spacetimedb::table(name = user, public)]
pub struct User {
    #[primary_key]
    identity: Identity,
    name: Option<String>,
    online: bool,
}

#[spacetimedb::table(name = message, public)]
pub struct Message {
    sender: Identity,
    sent: Timestamp,
    text: String,
}

// Scheduled reducer
// First, we declare the table with scheduling information.
#[spacetimedb::table(name = send_message_schedule, scheduled(send_scheduled_message))]
struct SendMessageSchedule {
    // Mandatory fields:
    // ============================

    /// An identifier for the scheduled reducer call.
    #[primary_key]
    #[auto_inc]
    scheduled_id: u64,

    /// Information about when the reducer should be called.
    scheduled_at: ScheduleAt,

    // In addition to the mandatory fields, any number of fields can be added.
    // These can be used to provide extra information to the scheduled reducer.

    // Custom fields:
    // ============================

    /// The text of the scheduled message to send.
    text: String,
}

fn validate_name(name: String) -> Result<String, String> {
    if name.is_empty() {
        Err("Names must not be empty".to_string())
    } else {
        Ok(name)
    }
}

#[spacetimedb::reducer]
pub fn set_name(ctx: &ReducerContext, name: String) -> Result<(), String> {
    let name = validate_name(name)?;
    if let Some(user) = ctx.db.user().identity().find(ctx.sender) {
        ctx.db.user().identity().update(User {
            name: Some(name),
            ..user
        });
        Ok(())
    } else {
        Err("Cannot set name for unknown user".to_string())
    }
}

fn validate_message(text: String) -> Result<String, String> {
    if text.is_empty() {
        Err("Messages must not be empty".to_string())
    } else {
        Ok(text)
    }
}

#[spacetimedb::reducer]
fn send_scheduled_message(ctx: &ReducerContext, arg: SendMessageSchedule) -> Result<(), String> {
    let message_to_send = arg.text;

    let result = send_message(ctx, message_to_send);

    if result.is_err() {
        log::error!("Error sending scheduled message: {}", result.err().unwrap());
    }

    Ok(())
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

// An example of a scheduled reducer that can only be called via scheduling.
#[spacetimedb::reducer]
fn scheduled_only_message(ctx: &ReducerContext, _args: SendMessageSchedule) -> Result<(), String> {
    if ctx.sender != ctx.identity() {
        return Err("Reducer `scheduled` may not be invoked by clients, only via scheduling.".into());
    }
    // Reducer body...
    Ok(())
}

// Now, we want to actually start scheduling reducers.
// It's convenient to do this inside the `init` reducer.
#[spacetimedb::reducer(init)]
fn init(ctx: &ReducerContext) {

    let current_time = ctx.timestamp;

    // Example of how to get the current time in microseconds since unix epoch.
    let _current_time_micros = current_time.to_micros_since_unix_epoch();

    let ten_seconds = TimeDuration::from_micros(10_000_000);

    let future_timestamp: Timestamp = current_time + ten_seconds;
    ctx.db.send_message_schedule().insert(SendMessageSchedule {
        scheduled_id: 0, // auto-incremented
        text:"I'm a bot sending a message one time".to_string(),

        // Creating a `ScheduleAt` from a `Timestamp` results in the reducer
        // being called once, at exactly the time `future_timestamp`.
        scheduled_at: future_timestamp.into()
    });

    let loop_duration: TimeDuration = ten_seconds;
    ctx.db.send_message_schedule().insert(SendMessageSchedule {
        scheduled_id: 0, // auto-incremented
        text:"I'm a bot sending a message every 10 seconds".to_string(),

        // Creating a `ScheduleAt` from a `Duration` results in the reducer
        // being called in a loop, once every `loop_duration`.
        scheduled_at: loop_duration.into()
    });
}

#[spacetimedb::reducer(client_connected)]
pub fn identity_connected(ctx: &ReducerContext) {
    if let Some(user) = ctx.db.user().identity().find(ctx.sender) {
        // If this is a returning user, i.e. we already have a `User` with this `Identity`,
        // set `online: true`, but leave `name` and `identity` unchanged.
        ctx.db.user().identity().update(User { online: true, ..user });
    } else {
        // If this is a new user, create a `User` row for the `Identity`,
        // which is online, but hasn't set a name.
        ctx.db.user().insert(User {
            name: None,
            identity: ctx.sender,
            online: true,
        });
    }
}

#[spacetimedb::reducer(client_disconnected)]
pub fn identity_disconnected(ctx: &ReducerContext) {
    if let Some(user) = ctx.db.user().identity().find(ctx.sender) {
        ctx.db.user().identity().update(User { online: false, ..user });
    } else {
        // This branch should be unreachable,
        // as it doesn't make sense for a client to disconnect without connecting first.
        log::warn!("Disconnect event for unknown user with identity {:?}", ctx.sender);
    }
}

