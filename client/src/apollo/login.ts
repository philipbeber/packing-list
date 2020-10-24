import { gql, useMutation } from "@apollo/client";
import { LoggedInUser } from "../model/loggedInUser";
import { loggedInVar } from "./cache";
import * as LoginTypes from "./__generated__/Login";

export const LOGIN_USER = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        username
        name
      }
    }
  }
`;

const localStorageVarName = "me";

export function initialLoginValue(): LoggedInUser | undefined {
  const userStr = localStorage.getItem(localStorageVarName);
  if (!userStr) {
    return undefined;
  }
  try {
    const user = JSON.parse(userStr) as LoggedInUser;
    if (user.id && user.token && user.name && user.username) {
      return user;
    }
  } catch (error) {}
  return undefined;
}

export function useLoginMutation() {
  return useMutation<LoginTypes.Login, LoginTypes.LoginVariables>(LOGIN_USER, {
    onCompleted({ login }) {
      console.log(login);
      if (login && login.token && login.user) {
        const user: LoggedInUser = {
          token: login.token,
          id: login.user.id,
          name: login.user.name,
          username: login.user.username,
        };
        localStorage.setItem(localStorageVarName, JSON.stringify(user));
        loggedInVar(user);
      }
    },
    onError(error) {
      console.log(error);
    },
  });
}

export function logout() {
  localStorage.removeItem(localStorageVarName);
  loggedInVar(undefined);
}
