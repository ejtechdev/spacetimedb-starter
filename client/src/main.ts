import { ChatInput } from "./components/ChatInput";
import { ChatMessages } from "./components/ChatMessages";
import { NameInput } from "./components/NameInput";
import { UsersList } from "./components/UsersList";
import { Constants } from "./config/constants";
import { User } from "./module_bindings";
import { dbService } from "./services/spacetimedb-service";
import "./styles/main.css";

// Import assets
import "/vite.svg";

// Global state
let users = new Map<string, User>();
let playerMessages = new Map<string, { text: string; timestamp: number }[]>();

// UI Components
let usersList: UsersList;
let chatMessages: ChatMessages;
let chatInput: ChatInput;
let nameInput: NameInput;
let connectionStatusElement: HTMLElement;

/**
 * Application initialization
 */
function initializeApp() {
  console.log("Initializing SpacetimeDB Chat application");

  // Get UI elements
  connectionStatusElement = document.getElementById(
    "connectionStatus"
  ) as HTMLElement;

  if (!connectionStatusElement) {
    console.error("Required DOM elements not found");
    return;
  }

  // Initialize UI components
  usersList = new UsersList("users-list");
  chatMessages = new ChatMessages("message-container");
  chatInput = new ChatInput("chatInput", "sendButton");
  nameInput = new NameInput("nameInput", "setNameButton");

  // Disable inputs initially
  chatInput.setEnabled(false);
  nameInput.setEnabled(false);

  // Set up event handlers
  setupEventHandlers();

  // Connect to SpacetimeDB
  connectToSpacetimeDB();
}

/**
 * Set up event handlers for components
 */
function setupEventHandlers() {
  // Handle chat message submission
  chatInput.onSubmit(({ text }) => {
    dbService.sendMessage(text);
  });

  // Handle name submission
  nameInput.onSubmit(({ name }) => {
    dbService.setUserName(name);
  });

  // Handle database events
  setupDatabaseEventHandlers();
}

/**
 * Set up event handlers for database events
 */
function setupDatabaseEventHandlers() {
  // Connection events
  dbService.onConnection((identity) => {
    console.log("Connected to SpacetimeDB");
    connectionStatusElement.textContent = Constants.textLabels.connected;

    // Update UI
    chatInput.setEnabled(true);
    nameInput.setEnabled(true);

    // Update components with identity
    usersList.setCurrentIdentity(identity);
    chatMessages.setCurrentIdentity(identity);

    // Set initial name if available
    const identityHex = identity.toHexString();
    const localUser = users.get(identityHex);
    if (localUser?.name) {
      nameInput.setValue(localUser.name);
    }
  });

  dbService.onDisconnect(() => {
    console.log("Disconnected from SpacetimeDB");
    connectionStatusElement.textContent = Constants.textLabels.disconnected;

    // Update UI
    chatInput.setEnabled(false);
    nameInput.setEnabled(false);

    // Clear state
    users = new Map();
    playerMessages = new Map();

    // Update components
    usersList.updateUsers(users);
    usersList.setCurrentIdentity(null);
    chatMessages.setCurrentIdentity(null);
  });

  dbService.onError((error) => {
    console.error("SpacetimeDB connection error:", error);
    connectionStatusElement.textContent = `${Constants.textLabels.errorPrefix}${error.message}`;

    // Update UI
    chatInput.setEnabled(false);
    nameInput.setEnabled(false);
  });

  // User events
  dbService.onUserInsert((user) => {
    const userIdHex = user.identity.toHexString();
    console.log(
      `User inserted: ${userIdHex.substring(0, Constants.identity.shortLength)}`
    );

    // Update users map
    const nextUsers = new Map(users);
    nextUsers.set(userIdHex, user);
    users = nextUsers;

    // Update components
    usersList.updateUsers(users);
    chatMessages.setUsers(users);
  });

  dbService.onUserUpdate((oldUser, newUser) => {
    const oldUserIdHex = oldUser.identity.toHexString();
    const newUserIdHex = newUser.identity.toHexString();
    console.log(
      `User updated: ${newUserIdHex.substring(
        0,
        Constants.identity.shortLength
      )} (Online: ${newUser.online})`
    );

    // Update users map
    const nextUsers = new Map(users);
    nextUsers.set(newUserIdHex, newUser);
    if (oldUserIdHex !== newUserIdHex) {
      nextUsers.delete(oldUserIdHex);
    }
    users = nextUsers;

    // Update components
    usersList.updateUsers(users);
    chatMessages.setUsers(users);
  });

  dbService.onUserDelete((user) => {
    const userIdHex = user.identity.toHexString();
    console.log(
      `User deleted: ${userIdHex.substring(0, Constants.identity.shortLength)}`
    );

    // Update users map
    const nextUsers = new Map(users);
    nextUsers.delete(userIdHex);
    users = nextUsers;

    // Update components
    usersList.updateUsers(users);
    chatMessages.setUsers(users);
  });

  // Message events
  dbService.onMessageInsert((message) => {
    if (!message.sender) return;

    const senderHex = message.sender.toHexString();
    const messageTimestamp = message.sent
      ? Math.floor(Number(message.sent.microsSinceUnixEpoch) / 1000)
      : Date.now();

    const newMessage = {
      text: message.text,
      timestamp: messageTimestamp,
    };

    // Store in message history
    const nextMessages = new Map(playerMessages);
    const currentMessages = nextMessages.get(senderHex) || [];
    nextMessages.set(senderHex, [...currentMessages, newMessage]); // Keep all messages
    playerMessages = nextMessages;

    // Add to chat
    chatMessages.addMessage(senderHex, message.text, messageTimestamp);
  });
}

/**
 * Connect to SpacetimeDB
 */
function connectToSpacetimeDB() {
  console.log("Connecting to SpacetimeDB...");
  connectionStatusElement.textContent = Constants.textLabels.connecting;
  dbService.connect();
}

// Initialize the application when the DOM is ready
document.addEventListener("DOMContentLoaded", initializeApp);
