import { Identity } from "@clockworklabs/spacetimedb-sdk";
import { Constants } from "../config/constants";
import { User } from "../module_bindings";

import { Reaction, ReactionEmoji } from "../module_bindings";
import { ReactionPicker } from "./ReactionPicker";

interface ChatMessage {
  messageId: bigint;
  senderIdentity: string;
  text: string;
  timestamp: number;
  element?: HTMLElement;
  reactions?: Reaction[];
}

interface ReactionToggleEvent {
  messageId: bigint;
  emoji: ReactionEmoji;
}

export class ChatMessages {
  private container: HTMLElement;
  private messages: ChatMessage[] = [];
  private users: Map<string, User> = new Map();
  private currentIdentity: Identity | null = null;
  private activeReactionPicker: ReactionPicker | null = null;
  private reactionToggleCallbacks: ((event: ReactionToggleEvent) => void)[] =
    [];

  /**
   * Create a new ChatMessages component
   * @param containerId ID of the container element
   */
  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container with id ${containerId} not found`);
    }
    this.container = container;
  }

  /**
   * Register a callback for reaction toggle events
   */
  public onReactionToggle(
    callback: (event: ReactionToggleEvent) => void
  ): void {
    this.reactionToggleCallbacks.push(callback);
  }

  /**
   * Set the users map for name resolution
   * @param users Map of users by identity
   */
  public setUsers(users: Map<string, User>): void {
    this.users = users;
  }

  /**
   * Set the current user's identity
   * @param identity The current user's identity
   */
  public setCurrentIdentity(identity: Identity | null): void {
    this.currentIdentity = identity;
  }

  /**
   * Format a timestamp for display
   * @param timestamp Timestamp in milliseconds
   * @returns Formatted time string (HH:MM:SS)
   */
  private formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  /**
   * Add a message to the chat
   * @param {ChatMessage} message The message to add
   */
  public addMessage({
    messageId,
    senderIdentity,
    text,
    timestamp,
    reactions = [],
  }: ChatMessage): void {
    // Create message element
    const messageEl = document.createElement("div");
    const isCurrentUser =
      this.currentIdentity?.toHexString() === senderIdentity;
    const messageTimestamp = timestamp || Date.now();

    // Set appropriate class
    messageEl.className = `message ${isCurrentUser ? "local-message" : ""}`;

    // Get sender name or fallback to identity shorthand
    const sender = this.users.get(senderIdentity);
    const senderName =
      sender?.name ||
      `User ${senderIdentity.substring(0, Constants.identity.shortLength)}`;

    // Format the timestamp
    const timeString = this.formatTime(messageTimestamp);

    // Set message content
    messageEl.innerHTML = `
      <span class="timestamp">[${timeString}]</span>
      <span class="sender">${senderName}:</span>
      <span class="text">${text}</span>
      <button class="reaction-button">😀</button>
      <div class="reactions"></div>
    `;

    const reactionButton = messageEl.querySelector(
      ".reaction-button"
    ) as HTMLButtonElement;
    reactionButton.addEventListener("click", (e) => {
      e.stopPropagation();
      this.showReactionPicker(messageEl, messageId);
    });

    // Add to DOM
    this.container.appendChild(messageEl);

    // Auto-scroll to bottom
    this.scrollToBottom();

    // Store message data
    const message: ChatMessage = {
      messageId,
      senderIdentity,
      text,
      timestamp: messageTimestamp,
      element: messageEl,
      reactions,
    };
    this.messages.push(message);

    // Display initial reactions
    this.updateReactions(messageEl, reactions);
  }

  public updateMessageReactions(
    messageId: bigint,
    reactions: Reaction[]
  ): void {
    const message = this.messages.find((m) => m.messageId === messageId);
    if (message?.element) {
      this.updateReactions(message.element, reactions);
      message.reactions = reactions;
    }
  }

  private showReactionPicker(messageEl: HTMLElement, messageId: bigint): void {
    // Remove any existing reaction picker
    if (this.activeReactionPicker) {
      this.activeReactionPicker.close();
      this.activeReactionPicker = null;
    }

    // Create and show new reaction picker
    this.activeReactionPicker = new ReactionPicker(
      () => {
        this.activeReactionPicker = null;
      },
      (emoji: ReactionEmoji) => {
        // Emit event for parent to handle
        this.reactionToggleCallbacks.forEach((callback) =>
          callback({ messageId, emoji })
        );
      }
    );
    this.activeReactionPicker.show(messageEl);
  }

  public updateReactions(messageEl: HTMLElement, reactions: Reaction[]): void {
    const reactionsContainer = messageEl.querySelector(
      ".reactions"
    ) as HTMLElement;
    if (!reactionsContainer) return;

    // Clear existing reactions
    reactionsContainer.innerHTML = "";

    // Group reactions by emoji type
    const groupedReactions = reactions.reduce((acc, reaction) => {
      const key = reaction.emoji.tag;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(reaction);
      return acc;
    }, {} as Record<string, Reaction[]>);

    // Create reaction elements
    Object.entries(groupedReactions).forEach(([tag, reactions]) => {
      const reactionEl = document.createElement("div");
      reactionEl.className = "reaction";

      // Get emoji for this reaction type
      const emoji = this.getEmojiForReactionType(tag);

      // Create reaction content
      reactionEl.innerHTML = `
        <span class="reaction-emoji">${emoji}</span>
        <span class="reaction-count">${reactions.length}</span>
      `;

      // Add click handler to toggle reaction
      reactionEl.addEventListener("click", (e) => {
        e.stopPropagation();
        const reaction = reactions[0]; // Use first reaction as reference
        // Emit event for parent to handle
        this.reactionToggleCallbacks.forEach((callback) =>
          callback({ messageId: reaction.messageId, emoji: reaction.emoji })
        );
      });

      reactionsContainer.appendChild(reactionEl);
    });
  }

  private getEmojiForReactionType(tag: string): string {
    const emojiMap: Record<string, string> = {
      ThumbsUp: "👍",
      Heart: "❤️",
      Laugh: "😂",
      Party: "🎉",
      Wow: "😮",
      Rocket: "🚀",
    };
    return emojiMap[tag] || "❓";
  }

  /**
   * Scroll the container to the bottom
   */
  private scrollToBottom(): void {
    this.container.scrollTop = this.container.scrollHeight;
  }
}
