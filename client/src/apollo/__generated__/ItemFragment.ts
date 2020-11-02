/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ItemState } from "./../../__generated__/globalTypes";

// ====================================================
// GraphQL fragment: ItemFragment
// ====================================================

export interface ItemFragment {
  __typename: "Item";
  id: string;
  name: string;
  deleted: boolean;
  state: ItemState;
}
