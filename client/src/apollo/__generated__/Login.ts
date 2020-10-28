/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: Login
// ====================================================

export interface Login_login_user {
  __typename: "User";
  id: string;
  username: string;
  name: string;
}

export interface Login_login {
  __typename: "LoginResponse";
  token: string;
  user: Login_login_user;
}

export interface Login {
  login: Login_login | null;
}

export interface LoginVariables {
  email: string;
  password: string;
}
