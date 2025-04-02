use spacetimedb::SpacetimeType;

/// Represents an emoji reaction to a chat message.
#[derive(SpacetimeType)]
pub enum ReactionEmoji {
    ThumbsUp,   // 👍
    Heart,      // ❤️
    Laugh,      // 😂
    Party,      // 🎉
    Wow,        // 😮
    Rocket,     // 🚀
}

/// Extension trait for ReactionEmoji to provide a method to convert to an emoji string.
impl ReactionEmoji {
    /// Converts the ReactionEmoji enum variant to its corresponding emoji string.
    ///
    /// # Returns
    /// A string slice representing the emoji.
    pub fn to_emoji(&self) -> &'static str {
        match self {
            ReactionEmoji::ThumbsUp => "👍",
            ReactionEmoji::Heart => "❤️",
            ReactionEmoji::Laugh => "😂",
            ReactionEmoji::Party => "🎉",
            ReactionEmoji::Wow => "😮",
            ReactionEmoji::Rocket => "🚀",
        }
    }
}