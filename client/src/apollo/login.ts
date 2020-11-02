import { gql, useMutation } from "@apollo/client";
import { LoggedInUser } from "../model/loggedInUser";
import { CAMP_FRAGMENT } from "./fragments";
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
      camps {
        ...CampFragment
      }
    }
  }
  ${CAMP_FRAGMENT}
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
    },
    onError(error) {
      console.log(error);
    },
  });
}

