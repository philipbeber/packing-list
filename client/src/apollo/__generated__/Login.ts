/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ItemState } from "./../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: Login
// ====================================================

export interface Login_login_user {
  __typename: "User";
  id: string;
  username: string;
  name: string;
}

export interface Login_login_camps_lists_items {
  __typename: "Item";
  id: string;
  name: string;
  deleted: boolean;
  state: ItemState;
}

export interface Login_login_camps_lists {
  __typename: "List";
  id: string;
  name: string;
  items: Login_login_camps_lists_items[];
}

export interface Login_login_camps {
  __typename: "Camp";
  id: string;
  name: string;
  lists: Login_login_camps_lists[];
  revision: number;
}

export interface Login_login {
  __typename: "LoginResponse";
  token: string;
  user: Login_login_user;
  camps: Login_login_camps[];
}

export interface Login {
  login: Login_login | null;
}

export interface LoginVariables {
  email: string;
  password: string;
}
