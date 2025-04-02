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

import { ReactionEmoji as __ReactionEmoji } from "./reaction_emoji_type";

export type ToggleReaction = {
  messageId: bigint,
  emoji: __ReactionEmoji,
};

/**
 * A namespace for generated helper functions.
 */
export namespace ToggleReaction {
  /**
  * A function which returns this type represented as an AlgebraicType.
  * This function is derived from the AlgebraicType used to generate this type.
  */
  export function getTypeScriptAlgebraicType(): AlgebraicType {
    return AlgebraicType.createProductType([
      new ProductTypeElement("messageId", AlgebraicType.createU64Type()),
      new ProductTypeElement("emoji", __ReactionEmoji.getTypeScriptAlgebraicType()),
    ]);
  }

  export function serialize(writer: BinaryWriter, value: ToggleReaction): void {
    ToggleReaction.getTypeScriptAlgebraicType().serialize(writer, value);
  }

  export function deserialize(reader: BinaryReader): ToggleReaction {
    return ToggleReaction.getTypeScriptAlgebraicType().deserialize(reader);
  }

}

