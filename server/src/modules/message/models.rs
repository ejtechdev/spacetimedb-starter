use spacetimedb::{Identity, Timestamp};

#[spacetimedb::table(name = message, public)]
pub struct Message {
    pub sender: Identity,
    pub sent: Timestamp,
    pub text: String,
}
