import { gql } from "@apollo/client";

export const ITEM_FRAGMENT = gql`
  fragment ItemFragment on Item {
    id
    name
    deleted
    state
  }`;

export const LIST_FRAGMENT = gql`
  fragment ListFragment on List {
    id
    name
    items {
      ...ItemFragment
    }
  }
  ${ITEM_FRAGMENT}
`;

export const CAMP_FRAGMENT = gql`
  fragment CampFragment on Camp {
    id
    name
    lists {
      ...ListFragment
    }
    revision
  }
  ${LIST_FRAGMENT}
`;

export const OPERATION_FRAGMENT = gql`
  fragment OperationFragment on Operation {
    type
    id
    timestamp
    campId
    listId
    itemId
    itemIds
    name
    state
    deleted
  }
`;
