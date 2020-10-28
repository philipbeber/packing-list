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

export interface OperationInput {
  type: string;
  id: string;
  timestamp: number;
  listId?: string | null;
  itemIds?: (string | null)[] | null;
  name?: string | null;
  state?: ItemState | null;
  deleted?: boolean | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
