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
import { Reaction } from "./reaction_type";
import { ReactionEmoji as __ReactionEmoji } from "./reaction_emoji_type";

import { EventContext, Reducer, RemoteReducers, RemoteTables } from ".";

/**
 * Table handle for the table `reaction`.
 *
 * Obtain a handle from the [`reaction`] property on [`RemoteTables`],
 * like `ctx.db.reaction`.
 *
 * Users are encouraged not to explicitly reference this type,
 * but to directly chain method calls,
 * like `ctx.db.reaction.on_insert(...)`.
 */
export class ReactionTableHandle {
  tableCache: TableCache<Reaction>;

  constructor(tableCache: TableCache<Reaction>) {
    this.tableCache = tableCache;
  }

  count(): number {
    return this.tableCache.count();
  }

  iter(): Iterable<Reaction> {
    return this.tableCache.iter();
  }
  /**
   * Access to the `reaction_id` unique index on the table `reaction`,
   * which allows point queries on the field of the same name
   * via the [`ReactionReactionIdUnique.find`] method.
   *
   * Users are encouraged not to explicitly reference this type,
   * but to directly chain method calls,
   * like `ctx.db.reaction.reaction_id().find(...)`.
   *
   * Get a handle on the `reaction_id` unique index on the table `reaction`.
   */
  reaction_id = {
    // Find the subscribed row whose `reaction_id` column value is equal to `col_val`,
    // if such a row is present in the client cache.
    find: (col_val: bigint): Reaction | undefined => {
      for (let row of this.tableCache.iter()) {
        if (deepEqual(row.reaction_id, col_val)) {
          return row;
        }
      }
    },
  };

  onInsert = (cb: (ctx: EventContext, row: Reaction) => void) => {
    return this.tableCache.onInsert(cb);
  }

  removeOnInsert = (cb: (ctx: EventContext, row: Reaction) => void) => {
    return this.tableCache.removeOnInsert(cb);
  }

  onDelete = (cb: (ctx: EventContext, row: Reaction) => void) => {
    return this.tableCache.onDelete(cb);
  }

  removeOnDelete = (cb: (ctx: EventContext, row: Reaction) => void) => {
    return this.tableCache.removeOnDelete(cb);
  }

  // Updates are only defined for tables with primary keys.
  onUpdate = (cb: (ctx: EventContext, oldRow: Reaction, newRow: Reaction) => void) => {
    return this.tableCache.onUpdate(cb);
  }

  removeOnUpdate = (cb: (ctx: EventContext, onRow: Reaction, newRow: Reaction) => void) => {
    return this.tableCache.removeOnUpdate(cb);
  }}
