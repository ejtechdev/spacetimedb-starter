import { Identity } from "@clockworklabs/spacetimedb-sdk";
import { Constants } from "../config/constants";
import { User } from "../module_bindings";

interface ChatMessage {
  senderIdentity: string;
  text: string;
  timestamp: number;
  element: HTMLElement;
}

/**
 * Component for rendering chat messages
 */
export class ChatMessages {
  private container: HTMLElement;
  private messages: ChatMessage[] = [];
  private users: Map<string, User> = new Map();
  private currentIdentity: Identity | null = null;

  /**
   * Create a new ChatMessages component
   * @param containerId ID of the container element
   */
  constructor(containerId: string) {
    const element = document.getElementById(containerId);
    if (!element) {
      throw new Error(`Element with ID "${containerId}" not found`);
    }
    this.container = element;
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
   * @param senderIdentity Sender's identity string
   * @param text Message text
   * @param timestamp Optional timestamp (defaults to current time if not provided)
   */
  public addMessage(
    senderIdentity: string,
    text: string,
    timestamp?: number
  ): void {
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
    `;

    // Add to DOM
    this.container.appendChild(messageEl);

    // Auto-scroll to bottom
    this.scrollToBottom();

    // Store message data
    const message: ChatMessage = {
      senderIdentity,
      text,
      timestamp: messageTimestamp,
      element: messageEl,
    };
    this.messages.push(message);
  }

  /**
   * Scroll the container to the bottom
   */
  private scrollToBottom(): void {
    this.container.scrollTop = this.container.scrollHeight;
  }
}
