//!
//! Contains reducers related to scheduled tasks, including initialization and execution.

use crate::modules::message::reducers::send_message;
use crate::modules::scheduler::models::send_message_schedule;
use crate::modules::scheduler::models::SendMessageSchedule;
use spacetimedb::{ReducerContext, Table, TimeDuration, Timestamp};

/// Reducer called by the SpacetimeDB scheduler based on `SendMessageSchedule` table entries.
/// Sends a message using the text provided in the schedule arguments.
///
/// # Arguments
/// * `ctx` - The reducer context, providing information like timestamp and sender identity.
/// * `arg` - The `SendMessageSchedule` data associated with the triggered schedule.
///
/// # Returns
/// * `Ok(())` on success.
/// * `Err(String)` if sending the message fails (error is logged).
#[spacetimedb::reducer]
pub fn send_scheduled_message(
    ctx: &ReducerContext,
    arg: SendMessageSchedule,
) -> Result<(), String> {
    let message_to_send = arg.text;

    let result = send_message(ctx, message_to_send);

    if result.is_err() {
        log::error!("Error sending scheduled message: {}", result.err().unwrap());
    }

    Ok(())
}

/// An example of a reducer that can *only* be invoked via scheduling, not by clients.
/// Checks if the sender identity matches the module's own identity.
///
/// # Arguments
/// * `ctx` - The reducer context.
/// * `_args` - The `SendMessageSchedule` arguments (unused in this example).
///
/// # Returns
/// * `Ok(())` if called by the scheduler.
/// * `Err(String)` if called directly by a client.
#[spacetimedb::reducer]
pub fn scheduled_only_message(
    ctx: &ReducerContext,
    _args: SendMessageSchedule,
) -> Result<(), String> {
    if ctx.sender != ctx.identity() {
        return Err(
            "Reducer `scheduled` may not be invoked by clients, only via scheduling.".into(),
        );
    }
    // Reducer body...
    Ok(())
}

/// Initialization reducer for the scheduler module.
/// Called once when the module is published.
/// Sets up initial example schedules (one-time and repeating).
///
/// # Arguments
/// * `ctx` - The reducer context.
#[spacetimedb::reducer(init)]
pub fn init(ctx: &ReducerContext) {
    let current_time = ctx.timestamp;

    // Example of how to get the current time in microseconds since unix epoch.
    let _current_time_micros = current_time.to_micros_since_unix_epoch();

    let ten_seconds = TimeDuration::from_micros(10_000_000);

    let future_timestamp: Timestamp = current_time + ten_seconds;
    ctx.db.send_message_schedule().insert(SendMessageSchedule {
        scheduled_id: 0, // auto-incremented
        text: "I'm a bot sending a message one time".to_string(),

        // Creating a `ScheduleAt` from a `Timestamp` results in the reducer
        // being called once, at exactly the time `future_timestamp`.
        scheduled_at: future_timestamp.into(),
    });

    let loop_duration: TimeDuration = ten_seconds;
    ctx.db.send_message_schedule().insert(SendMessageSchedule {
        scheduled_id: 0, // auto-incremented
        text: "I'm a bot sending a message every 10 seconds".to_string(),

        // Creating a `ScheduleAt` from a `Duration` results in the reducer
        // being called in a loop, once every `loop_duration`.
        scheduled_at: loop_duration.into(),
    });
}
