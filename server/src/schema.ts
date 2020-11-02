import { gql } from "apollo-server";

export const typeDefs = gql`
  scalar Date

  type Query {
    me: User
  }

  type Mutation {
    synchronize(
      campId: ID!
      opIndex: Int!
      lastOp: ID
      newOps: [OperationInput!]
    ): SynchronizeResponse!
    login(email: String, password: String): LoginResponse
  }

  type Subscription {
    campOperationAdded(campId: ID!): Operation
  }

  type SendOperationsResponse {
    success: Boolean!
    message: String
  }

  type SynchronizeResponse {
    status: SyncStatus!
    updatedOps: [Operation!]
    campId: ID
  }

  enum SyncStatus {
    ALL_GOOD
    RETRY
    NEED_UPDATE
  }

  type LoginResponse {
    token: String!
    user: User!
    camps: [Camp!]!
  }

  type Operation {
    type: String!
    id: ID!
    timestamp: Date!
    campId: ID
    listId: ID
    itemId: ID
    itemIds: [ID!]
    name: String
    state: ItemState
    deleted: Boolean
  }

  input OperationInput {
    type: String!
    id: ID!
    timestamp: Date!
    listId: ID
    itemId: ID
    itemIds: [ID!]
    name: String
    state: ItemState
    deleted: Boolean
  }

  type CampUpdateResponse {
    success: Boolean!
    message: String
  }

  type Camp {
    id: ID!
    name: String!
    #members: [Member!]!
    lists: [List!]!
    #deleted: Boolean
    revision: Int!
  }

  type Member {
    id: Int
    name: String
    userId: ID
    role: String
    deleted: Boolean
  }

  type User {
    id: ID!
    username: String!
    name: String!
  }

  type List {
    id: ID!
    name: String!
    items: [Item!]!
    position: Float
  }

  type Item {
    id: ID!
    name: String!
    assignedTo: [Int!]
    state: ItemState!
    position: Float
    deleted: Boolean!
  }

  enum ItemState {
    UNPURCHASED
    PURCHASED
    PACKEDIN
    PACKEDOUT
  }
`;
