import { Identity } from "@clockworklabs/spacetimedb-sdk";
import { Constants } from "../config/constants";
import { User } from "../module_bindings";

/**
 * Component for rendering the list of users
 */
export class UsersList {
  private container: HTMLElement;
  private users: Map<string, User> = new Map();
  private currentIdentity: Identity | null = null;

  /**
   * Create a new UsersList component
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
   * Update the list of users
   * @param users Map of users by identity
   */
  public updateUsers(users: Map<string, User>): void {
    this.users = users;
    this.render();
  }

  /**
   * Set the current user's identity
   * @param identity The current user's identity
   */
  public setCurrentIdentity(identity: Identity | null): void {
    this.currentIdentity = identity;
    this.render();
  }

  /**
   * Render the users list
   */
  private render(): void {
    // Clear the container
    this.container.innerHTML = "";

    // Sort users - online first, then by name
    const sortedUsers = Array.from(this.users.values()).sort((a, b) => {
      if (a.online !== b.online) return a.online ? -1 : 1;
      return (a.name || "") > (b.name || "") ? 1 : -1;
    });

    // Create elements for each user
    sortedUsers.forEach((user) => {
      const userEl = document.createElement("div");
      const identityHex = user.identity.toHexString();

      // Set class based on online status
      userEl.className = `user ${user.online ? "online" : "offline"}`;

      // Mark local user
      if (
        this.currentIdentity &&
        identityHex === this.currentIdentity.toHexString()
      ) {
        userEl.classList.add("local-user");
      }

      // Display name or identity shorthand
      const displayName =
        user.name || identityHex.substring(0, Constants.identity.shortLength);

      // Create content
      userEl.innerHTML = `
        <span class="status-dot"></span>
        <span class="user-name">${displayName}</span>
      `;

      // Add to container
      this.container.appendChild(userEl);
    });
  }
}
