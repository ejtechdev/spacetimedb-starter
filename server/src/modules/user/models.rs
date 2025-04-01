use spacetimedb::{Identity, Timestamp};

#[spacetimedb::table(name = user, public)]
pub struct User {
    #[primary_key]
    pub identity: Identity,
    pub name: Option<String>,
    pub online: bool,
    pub last_active: Timestamp,
}
