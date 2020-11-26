import { ApolloClient, gql, NormalizedCacheObject } from "@apollo/client";
import { SyncStatus } from "../__generated__/globalTypes";
import {
  CampOperation
} from "desert-thing-packing-list-common";
import { Synchronize, SynchronizeVariables } from "./__generated__/Synchronize";
import { OPERATION_FRAGMENT } from "./fragments";

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
      status
      updatedOps {
        ...OperationFragment
      }
      campId
    }
  }
  ${OPERATION_FRAGMENT}
`;

export async function synchronize(
  client: ApolloClient<NormalizedCacheObject>,
  campId: string,
  opIndex: number,
  lastOp: string | undefined,
  newOps: CampOperation[],
  token: string
): Promise<{status: SyncStatus, serverOps?: CampOperation[], campId?: string}> {

  const result = await client.mutate<Synchronize, SynchronizeVariables>({
    mutation: SYNCHRONIZE,
    variables: {
      campId,
      opIndex,
      lastOp,
      newOps,
    },
    context: {
      headers: { authorization: `Bearer ${token}` },
    },
  });
  if (result.errors) {
    result.errors.forEach(error => {
      console.error(error);
    });
    return { status: SyncStatus.RETRY };
  }
  if (!result.data) {
    console.error("No data");
    return { status: SyncStatus.RETRY}
  }
  return {
    status: result.data.synchronize.status,
    serverOps: result.data.synchronize.updatedOps as CampOperation[],
    campId: result.data.synchronize.campId || undefined
  };
}
