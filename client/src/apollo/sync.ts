import { gql, ApolloClient } from "@apollo/client";
import {
  OperationInput,
  ItemState as WireItemState,
} from "../../__generated__/globalTypes";
import {
  CampOperation,
  ChangeCampItemStateOperation,
  ItemState,
} from "desert-thing-packing-list-common";
import { LoggedInUser } from "../model/loggedInUser";
import { loggedInVar } from "./cache";
import { client } from "./client";
import { Synchronize, SynchronizeVariables } from "./__generated__/Synchronize";

export const SYNCHRONIZE = gql`
  mutation Synchronize(
    $campId: ID!
    $opIndex: Int!
    $lastOp: ID
    $newOps: [OperationInput!]
  ) {
    synchronize(
      campId: $campId
      opIndex: $opIndex
      lastOp: $lastOp
      newOps: $newOps
    ) {
      type
      id
      timestamp
      campId
      listId
      itemIds
      name
      state
      deleted
    }
  }
`;

export async function synchronize(
  campId: string,
  opIndex: number,
  lastOp?: string,
  newOps?: CampOperation[]
) {
  const result = await client.mutate<Synchronize, SynchronizeVariables>({
    mutation: SYNCHRONIZE,
    variables: {
      campId,
      opIndex,
      lastOp,
      newOps,
    },
  });
  console.log(result.data);
}
