//! Contains reducers related to user management (connection, disconnection, name setting).

use crate::modules::user::models::user;
use crate::modules::user::models::User;
use spacetimedb::ReducerContext;
use spacetimedb::Table;

/// Validates a potential username.
/// Ensures the name is not empty.
///
/// # Arguments
/// * `name` - The name string to validate.
///
/// # Returns
/// * `Ok(String)` if the name is valid.
/// * `Err(String)` with an error message if validation fails.
fn validate_name(name: String) -> Result<String, String> {
    if name.is_empty() {
        Err("Names must not be empty".to_string())
    } else {
        Ok(name)
    }
}

/// Reducer to allow a user to set or update their display name.
/// Requires the user to exist in the User table (i.e., be connected).
///
/// # Arguments
/// * `ctx` - The reducer context, providing sender identity.
/// * `name` - The desired display name.
///
/// # Returns
/// * `Ok(())` on successful name update.
/// * `Err(String)` if name validation fails or the user is not found.
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

/// Reducer automatically called by SpacetimeDB when a client connects.
/// Creates a new User record if it's a new connection, otherwise marks the existing user as online.
/// Initializes or updates the `last_active` timestamp.
///
/// # Arguments
/// * `ctx` - The reducer context, containing the connected client's identity as `sender`.
#[spacetimedb::reducer(client_connected)]
pub fn identity_connected(ctx: &ReducerContext) {
    if let Some(user) = ctx.db.user().identity().find(ctx.sender) {
        // If this is a returning user, i.e. we already have a `User` with this `Identity`,
        // set `online: true`, but leave `name` and `identity` unchanged.
        ctx.db.user().identity().update(User {
            online: true,
            ..user
        });
    } else {
        // If this is a new user, create a `User` row for the `Identity`,
        // which is online, but hasn't set a name.
        ctx.db.user().insert(User {
            name: None,
            identity: ctx.sender,
            online: true,
            last_active: ctx.timestamp,
        });
    }
}

/// Reducer automatically called by SpacetimeDB when a client disconnects.
/// Marks the corresponding user as offline. Does not remove the user row.
///
/// # Arguments
/// * `ctx` - The reducer context, containing the disconnected client's identity as `sender`.
#[spacetimedb::reducer(client_disconnected)]
pub fn identity_disconnected(ctx: &ReducerContext) {
    if let Some(user) = ctx.db.user().identity().find(ctx.sender) {
        ctx.db.user().identity().update(User {
            online: false,
            ..user
        });
    } else {
        // This branch should be unreachable,
        // as it doesn't make sense for a client to disconnect without connecting first.
        log::warn!(
            "Disconnect event for unknown user with identity {:?}",
            ctx.sender
        );
    }
}
