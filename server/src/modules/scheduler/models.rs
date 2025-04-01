use crate::modules::scheduler::reducers::send_scheduled_message;
use spacetimedb::ScheduleAt;
// Scheduled reducer
// First, we declare the table with scheduling information.
#[spacetimedb::table(name = send_message_schedule, scheduled(send_scheduled_message))]
pub struct SendMessageSchedule {
    // Mandatory fields:
    // ============================
    /// An identifier for the scheduled reducer call.
    #[primary_key]
    #[auto_inc]
    pub scheduled_id: u64,

    /// Information about when the reducer should be called.
    pub scheduled_at: ScheduleAt,

    // In addition to the mandatory fields, any number of fields can be added.
    // These can be used to provide extra information to the scheduled reducer.

    // Custom fields:
    // ============================
    /// The text of the scheduled message to send.
    pub text: String,
}
