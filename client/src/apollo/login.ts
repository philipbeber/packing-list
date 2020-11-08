import { gql } from "@apollo/client";
import { CAMP_FRAGMENT } from "./fragments";

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



