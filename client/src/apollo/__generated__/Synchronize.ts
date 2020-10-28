/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { OperationInput, ItemState } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: Synchronize
// ====================================================

export interface Synchronize_synchronize {
  __typename: "Operation";
  type: string;
  id: string;
  timestamp: number;
  campId: string | null;
  listId: string | null;
  itemIds: (string | null)[] | null;
  name: string | null;
  state: ItemState | null;
  deleted: boolean | null;
}

export interface Synchronize {
  synchronize: (Synchronize_synchronize | null)[] | null;
}

export interface SynchronizeVariables {
  campId: string;
  opIndex: number;
  lastOp?: string | null;
  newOps?: OperationInput[] | null;
}
