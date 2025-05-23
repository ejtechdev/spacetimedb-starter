// THIS FILE IS AUTOMATICALLY GENERATED BY SPACETIMEDB. EDITS TO THIS FILE
// WILL NOT BE SAVED. MODIFY TABLES IN YOUR MODULE SOURCE CODE INSTEAD.

/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
import {
  AlgebraicType,
  AlgebraicValue,
  BinaryReader,
  BinaryWriter,
  CallReducerFlags,
  ConnectionId,
  DbConnectionBuilder,
  DbConnectionImpl,
  DbContext,
  ErrorContextInterface,
  Event,
  EventContextInterface,
  Identity,
  ProductType,
  ProductTypeElement,
  ReducerEventContextInterface,
  SubscriptionBuilderImpl,
  SubscriptionEventContextInterface,
  SumType,
  SumTypeVariant,
  TableCache,
  TimeDuration,
  Timestamp,
  deepEqual,
} from "@clockworklabs/spacetimedb-sdk";

// Import and reexport all reducer arg types
import { IdentityConnected } from "./identity_connected_reducer.ts";
export { IdentityConnected };
import { IdentityDisconnected } from "./identity_disconnected_reducer.ts";
export { IdentityDisconnected };
import { ScheduledOnlyMessage } from "./scheduled_only_message_reducer.ts";
export { ScheduledOnlyMessage };
import { SendMessage } from "./send_message_reducer.ts";
export { SendMessage };
import { SendScheduledMessage } from "./send_scheduled_message_reducer.ts";
export { SendScheduledMessage };
import { SetName } from "./set_name_reducer.ts";
export { SetName };

// Import and reexport all table handle types
import { MessageTableHandle } from "./message_table.ts";
export { MessageTableHandle };
import { SendMessageScheduleTableHandle } from "./send_message_schedule_table.ts";
export { SendMessageScheduleTableHandle };
import { UserTableHandle } from "./user_table.ts";
export { UserTableHandle };

// Import and reexport all types
import { Message } from "./message_type.ts";
export { Message };
import { SendMessageSchedule } from "./send_message_schedule_type.ts";
export { SendMessageSchedule };
import { User } from "./user_type.ts";
export { User };

const REMOTE_MODULE = {
  tables: {
    message: {
      tableName: "message",
      rowType: Message.getTypeScriptAlgebraicType(),
    },
    send_message_schedule: {
      tableName: "send_message_schedule",
      rowType: SendMessageSchedule.getTypeScriptAlgebraicType(),
      primaryKey: "scheduledId",
    },
    user: {
      tableName: "user",
      rowType: User.getTypeScriptAlgebraicType(),
      primaryKey: "identity",
    },
  },
  reducers: {
    identity_connected: {
      reducerName: "identity_connected",
      argsType: IdentityConnected.getTypeScriptAlgebraicType(),
    },
    identity_disconnected: {
      reducerName: "identity_disconnected",
      argsType: IdentityDisconnected.getTypeScriptAlgebraicType(),
    },
    scheduled_only_message: {
      reducerName: "scheduled_only_message",
      argsType: ScheduledOnlyMessage.getTypeScriptAlgebraicType(),
    },
    send_message: {
      reducerName: "send_message",
      argsType: SendMessage.getTypeScriptAlgebraicType(),
    },
    send_scheduled_message: {
      reducerName: "send_scheduled_message",
      argsType: SendScheduledMessage.getTypeScriptAlgebraicType(),
    },
    set_name: {
      reducerName: "set_name",
      argsType: SetName.getTypeScriptAlgebraicType(),
    },
  },
  // Constructors which are used by the DbConnectionImpl to
  // extract type information from the generated RemoteModule.
  //
  // NOTE: This is not strictly necessary for `eventContextConstructor` because
  // all we do is build a TypeScript object which we could have done inside the
  // SDK, but if in the future we wanted to create a class this would be
  // necessary because classes have methods, so we'll keep it.
  eventContextConstructor: (imp: DbConnectionImpl, event: Event<Reducer>) => {
    return {
      ...(imp as DbConnection),
      event
    }
  },
  dbViewConstructor: (imp: DbConnectionImpl) => {
    return new RemoteTables(imp);
  },
  reducersConstructor: (imp: DbConnectionImpl, setReducerFlags: SetReducerFlags) => {
    return new RemoteReducers(imp, setReducerFlags);
  },
  setReducerFlagsConstructor: () => {
    return new SetReducerFlags();
  }
}

// A type representing all the possible variants of a reducer.
export type Reducer = never
| { name: "IdentityConnected", args: IdentityConnected }
| { name: "IdentityDisconnected", args: IdentityDisconnected }
| { name: "ScheduledOnlyMessage", args: ScheduledOnlyMessage }
| { name: "SendMessage", args: SendMessage }
| { name: "SendScheduledMessage", args: SendScheduledMessage }
| { name: "SetName", args: SetName }
;

export class RemoteReducers {
  constructor(private connection: DbConnectionImpl, private setCallReducerFlags: SetReducerFlags) {}

  onIdentityConnected(callback: (ctx: ReducerEventContext) => void) {
    this.connection.onReducer("identity_connected", callback);
  }

  removeOnIdentityConnected(callback: (ctx: ReducerEventContext) => void) {
    this.connection.offReducer("identity_connected", callback);
  }

  onIdentityDisconnected(callback: (ctx: ReducerEventContext) => void) {
    this.connection.onReducer("identity_disconnected", callback);
  }

  removeOnIdentityDisconnected(callback: (ctx: ReducerEventContext) => void) {
    this.connection.offReducer("identity_disconnected", callback);
  }

  scheduledOnlyMessage(args: SendMessageSchedule) {
    const __args = { args };
    let __writer = new BinaryWriter(1024);
    ScheduledOnlyMessage.getTypeScriptAlgebraicType().serialize(__writer, __args);
    let __argsBuffer = __writer.getBuffer();
    this.connection.callReducer("scheduled_only_message", __argsBuffer, this.setCallReducerFlags.scheduledOnlyMessageFlags);
  }

  onScheduledOnlyMessage(callback: (ctx: ReducerEventContext, args: SendMessageSchedule) => void) {
    this.connection.onReducer("scheduled_only_message", callback);
  }

  removeOnScheduledOnlyMessage(callback: (ctx: ReducerEventContext, args: SendMessageSchedule) => void) {
    this.connection.offReducer("scheduled_only_message", callback);
  }

  sendMessage(text: string) {
    const __args = { text };
    let __writer = new BinaryWriter(1024);
    SendMessage.getTypeScriptAlgebraicType().serialize(__writer, __args);
    let __argsBuffer = __writer.getBuffer();
    this.connection.callReducer("send_message", __argsBuffer, this.setCallReducerFlags.sendMessageFlags);
  }

  onSendMessage(callback: (ctx: ReducerEventContext, text: string) => void) {
    this.connection.onReducer("send_message", callback);
  }

  removeOnSendMessage(callback: (ctx: ReducerEventContext, text: string) => void) {
    this.connection.offReducer("send_message", callback);
  }

  sendScheduledMessage(arg: SendMessageSchedule) {
    const __args = { arg };
    let __writer = new BinaryWriter(1024);
    SendScheduledMessage.getTypeScriptAlgebraicType().serialize(__writer, __args);
    let __argsBuffer = __writer.getBuffer();
    this.connection.callReducer("send_scheduled_message", __argsBuffer, this.setCallReducerFlags.sendScheduledMessageFlags);
  }

  onSendScheduledMessage(callback: (ctx: ReducerEventContext, arg: SendMessageSchedule) => void) {
    this.connection.onReducer("send_scheduled_message", callback);
  }

  removeOnSendScheduledMessage(callback: (ctx: ReducerEventContext, arg: SendMessageSchedule) => void) {
    this.connection.offReducer("send_scheduled_message", callback);
  }

  setName(name: string) {
    const __args = { name };
    let __writer = new BinaryWriter(1024);
    SetName.getTypeScriptAlgebraicType().serialize(__writer, __args);
    let __argsBuffer = __writer.getBuffer();
    this.connection.callReducer("set_name", __argsBuffer, this.setCallReducerFlags.setNameFlags);
  }

  onSetName(callback: (ctx: ReducerEventContext, name: string) => void) {
    this.connection.onReducer("set_name", callback);
  }

  removeOnSetName(callback: (ctx: ReducerEventContext, name: string) => void) {
    this.connection.offReducer("set_name", callback);
  }

}

export class SetReducerFlags {
  scheduledOnlyMessageFlags: CallReducerFlags = 'FullUpdate';
  scheduledOnlyMessage(flags: CallReducerFlags) {
    this.scheduledOnlyMessageFlags = flags;
  }

  sendMessageFlags: CallReducerFlags = 'FullUpdate';
  sendMessage(flags: CallReducerFlags) {
    this.sendMessageFlags = flags;
  }

  sendScheduledMessageFlags: CallReducerFlags = 'FullUpdate';
  sendScheduledMessage(flags: CallReducerFlags) {
    this.sendScheduledMessageFlags = flags;
  }

  setNameFlags: CallReducerFlags = 'FullUpdate';
  setName(flags: CallReducerFlags) {
    this.setNameFlags = flags;
  }

}

export class RemoteTables {
  constructor(private connection: DbConnectionImpl) {}

  get message(): MessageTableHandle {
    return new MessageTableHandle(this.connection.clientCache.getOrCreateTable<Message>(REMOTE_MODULE.tables.message));
  }

  get sendMessageSchedule(): SendMessageScheduleTableHandle {
    return new SendMessageScheduleTableHandle(this.connection.clientCache.getOrCreateTable<SendMessageSchedule>(REMOTE_MODULE.tables.send_message_schedule));
  }

  get user(): UserTableHandle {
    return new UserTableHandle(this.connection.clientCache.getOrCreateTable<User>(REMOTE_MODULE.tables.user));
  }
}

export class SubscriptionBuilder extends SubscriptionBuilderImpl<RemoteTables, RemoteReducers, SetReducerFlags> { }

export class DbConnection extends DbConnectionImpl<RemoteTables, RemoteReducers, SetReducerFlags> {
  static builder = (): DbConnectionBuilder<DbConnection, ErrorContext, SubscriptionEventContext> => {
    return new DbConnectionBuilder<DbConnection, ErrorContext, SubscriptionEventContext>(REMOTE_MODULE, (imp: DbConnectionImpl) => imp as DbConnection);
  }
  subscriptionBuilder = (): SubscriptionBuilder => {
    return new SubscriptionBuilder(this);
  }
}

export type EventContext = EventContextInterface<RemoteTables, RemoteReducers, SetReducerFlags, Reducer>;
export type ReducerEventContext = ReducerEventContextInterface<RemoteTables, RemoteReducers, SetReducerFlags, Reducer>;
export type SubscriptionEventContext = SubscriptionEventContextInterface<RemoteTables, RemoteReducers, SetReducerFlags>;
export type ErrorContext = ErrorContextInterface<RemoteTables, RemoteReducers, SetReducerFlags>;
