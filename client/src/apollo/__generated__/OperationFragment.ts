/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ItemState } from "./../../__generated__/globalTypes";

// ====================================================
// GraphQL fragment: OperationFragment
// ====================================================

export interface OperationFragment {
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
