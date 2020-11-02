/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { OperationInput, SyncStatus, ItemState } from "./../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: Synchronize
// ====================================================

export interface Synchronize_synchronize_updatedOps {
  __typename: "Operation";
  type: string;
  id: string;
  timestamp: any;
  campId: string | null;
  listId: string | null;
  itemId: string | null;
  itemIds: string[] | null;
  name: string | null;
  state: ItemState | null;
  deleted: boolean | null;
}

export interface Synchronize_synchronize {
  __typename: "SynchronizeResponse";
  status: SyncStatus;
  updatedOps: Synchronize_synchronize_updatedOps[] | null;
  campId: string | null;
}

export interface Synchronize {
  synchronize: Synchronize_synchronize;
}

export interface SynchronizeVariables {
  campId: string;
  opIndex: number;
  lastOp?: string | null;
  newOps?: OperationInput[] | null;
}
