//! Defines data models related to scheduled tasks.

use crate::modules::scheduler::reducers::send_scheduled_message;
use spacetimedb::ScheduleAt;

/// Data structure defining a scheduled call to the `send_scheduled_message` reducer.
/// This table is configured via the `scheduled` argument in the `spacetimedb::table` macro.
#[spacetimedb::table(name = send_message_schedule, scheduled(send_scheduled_message))]
pub struct SendMessageSchedule {
    /// An identifier for the scheduled reducer call.
    /// Automatically incremented by SpacetimeDB.
    #[primary_key]
    #[auto_inc]
    pub scheduled_id: u64,

    /// Information about when the reducer should be called.
    /// Can be a specific `Timestamp` or a repeating `TimeDuration`.
    pub scheduled_at: ScheduleAt,

    // In addition to the mandatory fields, any number of fields can be added.
    // These can be used to provide extra information to the scheduled reducer.

    // Custom fields:
    // ============================
    /// The text of the scheduled message to send.
    pub text: String,
}
