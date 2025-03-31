import { Identity } from "@clockworklabs/spacetimedb-sdk";
import { DbConnection, Message, User } from "./module_bindings";
import "./style.css";
import typescriptLogo from "./typescript.svg";
import viteLogo from "/vite.svg";

// --- Configuration ---
const SPACETIME_DB_HOST = import.meta.env.PROD
  ? "wss://maincloud.spacetimedb.com"
  : "ws://localhost:3000";
const SPACETIME_DB_NAME = "spacetime-starter";
const MESSAGE_DURATION_MS = 5000;

// --- Global State ---
let dbConnection: DbConnection | null = null;
let localIdentity: Identity | null = null;
let isConnected = false;
let users = new Map<string, User>();
let playerMessages = new Map<string, { text: string; timestamp: number }[]>();

// DOM Elements
let nameInput: HTMLInputElement;
let setNameButton: HTMLButtonElement;
let chatInput: HTMLInputElement;
let sendButton: HTMLButtonElement;
let connectionStatusSpan: HTMLElement;
let messageContainer: HTMLElement;

// --- SpacetimeDB Event Handlers ---
const handleUserInsert = (_ctx: any, user: User) => {
  const userIdHex = user.identity.toHexString();
  console.log(`User Inserted: ${userIdHex.substring(0, 6)}`);
  const nextUsers = new Map(users);
  nextUsers.set(userIdHex, user);
  users = nextUsers; // Update global state
  updateUsersList();
};

const handleUserUpdate = (_ctx: any, oldUser: User, newUser: User) => {
  const oldUserIdHex = oldUser.identity.toHexString();
  const newUserIdHex = newUser.identity.toHexString();
  console.log(
    `User Updated: ${newUserIdHex.substring(0, 6)} (Online: ${newUser.online})`
  );
  const nextUsers = new Map(users);
  nextUsers.set(newUserIdHex, newUser);
  if (oldUserIdHex !== newUserIdHex) {
    nextUsers.delete(oldUserIdHex);
  }
  users = nextUsers; // Update global state
  updateUsersList();
};

const handleUserDelete = (_ctx: any, user: User) => {
  const userIdHex = user.identity.toHexString();
  console.log(`User Deleted: ${userIdHex.substring(0, 6)}`);
  const nextUsers = new Map(users);
  nextUsers.delete(userIdHex);
  users = nextUsers; // Update global state
  updateUsersList();
};

const handleMessageInsert = (_ctx: any, message: Message) => {
  if (!message.sender) return;
  const senderHex = message.sender.toHexString();
  const newMessage = { text: message.text, timestamp: Date.now() };

  const nextMessages = new Map(playerMessages);
  const currentMessages = nextMessages.get(senderHex) || [];
  nextMessages.set(senderHex, [...currentMessages, newMessage].slice(-10)); // Keep last 10
  playerMessages = nextMessages; // Update global state

  // Add message to UI
  displayMessage(senderHex, newMessage.text);

  // Auto-clear message after duration
  setTimeout(() => {
    const cleanupMessages = new Map(playerMessages);
    const current = cleanupMessages.get(senderHex) || [];
    const filtered = current.filter(
      (msg) =>
        !(
          msg.timestamp === newMessage.timestamp && msg.text === newMessage.text
        )
    );
    if (filtered.length > 0) {
      cleanupMessages.set(senderHex, filtered);
    } else {
      cleanupMessages.delete(senderHex);
    }
    playerMessages = cleanupMessages; // Update global state
  }, MESSAGE_DURATION_MS);
};

// --- SpacetimeDB Connection Logic ---
function connectToSpacetimeDB() {
  console.log("Attempting connection...");
  connectionStatusSpan.textContent = "Connecting...";
  isConnected = false;
  localIdentity = null;
  dbConnection = null; // Clear previous connection if any

  DbConnection.builder()
    .withUri(SPACETIME_DB_HOST)
    .withModuleName(SPACETIME_DB_NAME)
    .withToken(localStorage.getItem("auth_token") || "")
    .onConnect((conn: DbConnection, identity: Identity, token: string) => {
      console.log("Connected! ID:", identity.toHexString());
      dbConnection = conn;
      localIdentity = identity;
      isConnected = true;
      localStorage.setItem("auth_token", token);
      connectionStatusSpan.textContent = "Connected";
      updateUIForConnection(true);

      // Register listeners after connection
      try {
        if (conn.db?.user) {
          conn.db.user.onInsert(handleUserInsert);
          conn.db.user.onUpdate(handleUserUpdate);
          conn.db.user.onDelete(handleUserDelete);
          console.log("User listeners attached.");
        } else {
          console.warn("conn.db.user not ready on connect?");
        }
        if (conn.db?.message) {
          conn.db.message.onInsert(handleMessageInsert);
          console.log("Message listener attached.");
        } else {
          console.warn("conn.db.message not ready on connect?");
        }
      } catch (e) {
        console.error("Error registering listeners:", e);
      }

      // Initial subscription
      conn
        .subscriptionBuilder()
        .subscribe(["SELECT * FROM user", "SELECT * FROM message"]);
    })
    .onDisconnect(() => {
      console.log("Disconnected.");
      isConnected = false;
      localIdentity = null;
      connectionStatusSpan.textContent = "Disconnected";
      updateUIForConnection(false);
      // Clear local state on disconnect
      users = new Map();
      playerMessages = new Map();
      dbConnection = null; // Ensure connection is cleared
    })
    .onConnectError((_ctx, err) => {
      console.error("Connection Error:", err);
      isConnected = false;
      localIdentity = null;
      connectionStatusSpan.textContent = `Error: ${err.message}`;
      updateUIForConnection(false);
      dbConnection = null;
    })
    .build();
}

// --- UI Update Functions ---
function updateUIForConnection(connected: boolean) {
  nameInput.disabled = !connected;
  setNameButton.disabled = !connected;
  chatInput.disabled = !connected;
  sendButton.disabled = !connected;

  if (connected && localIdentity) {
    const localUser = users.get(localIdentity.toHexString());
    nameInput.value = localUser?.name || ""; // Set initial name if available
  }
}

function updateUsersList() {
  const usersList = document.getElementById("users-list");
  if (!usersList) return;

  usersList.innerHTML = "";

  // Sort users - online first, then by name
  const sortedUsers = Array.from(users.values()).sort((a, b) => {
    if (a.online !== b.online) return a.online ? -1 : 1;
    return (a.name || "") > (b.name || "") ? 1 : -1;
  });

  sortedUsers.forEach((user) => {
    const userEl = document.createElement("div");
    userEl.className = `user ${user.online ? "online" : "offline"}`;

    // Highlight local user
    if (
      localIdentity &&
      user.identity.toHexString() === localIdentity.toHexString()
    ) {
      userEl.classList.add("local-user");
    }

    const name =
      user.name || `User ${user.identity.toHexString().substring(0, 6)}`;
    userEl.innerHTML = `
      <span class="status-dot"></span>
      <span class="user-name">${name}</span>
    `;
    usersList.appendChild(userEl);
  });
}

function displayMessage(senderHex: string, text: string) {
  const sender = users.get(senderHex);
  const senderName = sender?.name || `User ${senderHex.substring(0, 6)}`;
  const isLocalMessage = localIdentity?.toHexString() === senderHex;

  const messageEl = document.createElement("div");
  messageEl.className = `message ${isLocalMessage ? "local-message" : ""}`;
  messageEl.innerHTML = `
    <span class="sender">${senderName}:</span>
    <span class="text">${text}</span>
  `;

  messageContainer.appendChild(messageEl);
  messageContainer.scrollTop = messageContainer.scrollHeight; // Auto-scroll
}

// --- Setup HTML and Initialize App ---
function setupUI() {
  document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
    <div class="chat-app">
      <header>
        <div class="logo-container">
          <a href="https://vitejs.dev" target="_blank">
            <img src="${viteLogo}" class="logo" alt="Vite logo" />
          </a>
          <a href="https://www.typescriptlang.org/" target="_blank">
            <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
          </a>
          <h1>SpacetimeDB Chat</h1>
        </div>
        <div class="connection-info">
          Status: <span id="connectionStatus">Disconnected</span>
        </div>
      </header>
      
      <main>
        <div class="user-panel">
          <h2>Users</h2>
          <div id="users-list" class="users-list"></div>
        </div>
        
        <div class="chat-panel">
          <div id="message-container" class="message-container"></div>
          
          <div class="input-container">
            <input 
              type="text" 
              id="chatInput" 
              placeholder="Type a message..." 
              disabled
            />
            <button id="sendButton" disabled>Send</button>
          </div>
        </div>
      </main>
      
      <div class="name-container">
        <label for="nameInput">Your Name:</label>
        <input 
          type="text" 
          id="nameInput" 
          placeholder="Set your name..." 
          disabled
        />
        <button id="setNameButton" disabled>Set Name</button>
      </div>
    </div>
  `;
}

// --- Initialization Code (runs after DOM is ready) ---
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM Ready");

  // Setup UI
  setupUI();

  // Get DOM elements
  nameInput = document.getElementById("nameInput") as HTMLInputElement;
  setNameButton = document.getElementById("setNameButton") as HTMLButtonElement;
  chatInput = document.getElementById("chatInput") as HTMLInputElement;
  sendButton = document.getElementById("sendButton") as HTMLButtonElement;
  connectionStatusSpan = document.getElementById("connectionStatus")!;
  messageContainer = document.getElementById("message-container")!;

  // Add UI Event Listeners
  setNameButton.addEventListener("click", () => {
    const name = nameInput.value.trim();
    if (isConnected && dbConnection?.reducers?.setName && name) {
      try {
        console.log("Sending setName:", name);
        dbConnection.reducers.setName(name);
      } catch (e) {
        console.error("Error sending setName:", e);
      }
    } else {
      console.warn("Cannot set name: Not connected or name empty");
    }
  });

  const sendMessage = () => {
    const text = chatInput.value.trim();
    if (isConnected && dbConnection?.reducers?.sendMessage && text) {
      try {
        console.log("Sending sendMessage:", text);
        dbConnection.reducers.sendMessage(text);
        chatInput.value = ""; // Clear input
        // Keep focus on the chat input after sending
        chatInput.focus();
      } catch (e) {
        console.error("Error sending sendMessage:", e);
      }
    }
  };

  sendButton.addEventListener("click", sendMessage);
  chatInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  });

  // Initial UI state
  updateUIForConnection(false);

  // Start SpacetimeDB connection
  connectToSpacetimeDB();
});
