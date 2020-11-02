/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ItemState } from "./../../__generated__/globalTypes";

// ====================================================
// GraphQL fragment: ListFragment
// ====================================================

export interface ListFragment_items {
  __typename: "Item";
  id: string;
  name: string;
  deleted: boolean;
  state: ItemState;
}

export interface ListFragment {
  __typename: "List";
  id: string;
  name: string;
  items: ListFragment_items[];
}
