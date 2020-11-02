/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum ItemState {
  PACKEDIN = "PACKEDIN",
  PACKEDOUT = "PACKEDOUT",
  PURCHASED = "PURCHASED",
  UNPURCHASED = "UNPURCHASED",
}

export enum SyncStatus {
  ALL_GOOD = "ALL_GOOD",
  NEED_UPDATE = "NEED_UPDATE",
  RETRY = "RETRY",
}

export interface OperationInput {
  type: string;
  id: string;
  timestamp: any;
  listId?: string | null;
  itemId?: string | null;
  itemIds?: string[] | null;
  name?: string | null;
  state?: ItemState | null;
  deleted?: boolean | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
