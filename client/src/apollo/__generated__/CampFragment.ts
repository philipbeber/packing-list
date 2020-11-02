/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ItemState } from "./../../__generated__/globalTypes";

// ====================================================
// GraphQL fragment: CampFragment
// ====================================================

export interface CampFragment_lists_items {
  __typename: "Item";
  id: string;
  name: string;
  deleted: boolean;
  state: ItemState;
}

export interface CampFragment_lists {
  __typename: "List";
  id: string;
  name: string;
  items: CampFragment_lists_items[];
}

export interface CampFragment {
  __typename: "Camp";
  id: string;
  name: string;
  lists: CampFragment_lists[];
  revision: number;
}
