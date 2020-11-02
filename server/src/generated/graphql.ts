import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Date: any;
  /** The `Upload` scalar type represents a file upload. */
  Upload: any;
};

export enum CacheControlScope {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE'
}

export type Camp = {
  __typename?: 'Camp';
  id: Scalars['ID'];
  name: Scalars['String'];
  lists: Array<List>;
  revision: Scalars['Int'];
};

export type CampUpdateResponse = {
  __typename?: 'CampUpdateResponse';
  success: Scalars['Boolean'];
  message?: Maybe<Scalars['String']>;
};


export type Item = {
  __typename?: 'Item';
  id: Scalars['ID'];
  name: Scalars['String'];
  assignedTo?: Maybe<Array<Scalars['Int']>>;
  state: ItemState;
  position?: Maybe<Scalars['Float']>;
  deleted: Scalars['Boolean'];
};

export enum ItemState {
  UNPURCHASED = 'UNPURCHASED',
  PURCHASED = 'PURCHASED',
  PACKEDIN = 'PACKEDIN',
  PACKEDOUT = 'PACKEDOUT'
}

export type List = {
  __typename?: 'List';
  id: Scalars['ID'];
  name: Scalars['String'];
  items: Array<Item>;
  position?: Maybe<Scalars['Float']>;
};

export type LoginResponse = {
  __typename?: 'LoginResponse';
  token: Scalars['String'];
  user: User;
  camps: Array<Camp>;
};

export type Member = {
  __typename?: 'Member';
  id?: Maybe<Scalars['Int']>;
  name?: Maybe<Scalars['String']>;
  userId?: Maybe<Scalars['ID']>;
  role?: Maybe<Scalars['String']>;
  deleted?: Maybe<Scalars['Boolean']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  synchronize: SynchronizeResponse;
  login?: Maybe<LoginResponse>;
};


export type MutationSynchronizeArgs = {
  campId: Scalars['ID'];
  opIndex: Scalars['Int'];
  lastOp?: Maybe<Scalars['ID']>;
  newOps?: Maybe<Array<OperationInput>>;
};


export type MutationLoginArgs = {
  email?: Maybe<Scalars['String']>;
  password?: Maybe<Scalars['String']>;
};

export type Operation = {
  __typename?: 'Operation';
  type: Scalars['String'];
  id: Scalars['ID'];
  timestamp: Scalars['Date'];
  campId?: Maybe<Scalars['ID']>;
  listId?: Maybe<Scalars['ID']>;
  itemId?: Maybe<Scalars['ID']>;
  itemIds?: Maybe<Array<Scalars['ID']>>;
  name?: Maybe<Scalars['String']>;
  state?: Maybe<ItemState>;
  deleted?: Maybe<Scalars['Boolean']>;
};

export type OperationInput = {
  type: Scalars['String'];
  id: Scalars['ID'];
  timestamp: Scalars['Date'];
  listId?: Maybe<Scalars['ID']>;
  itemId?: Maybe<Scalars['ID']>;
  itemIds?: Maybe<Array<Scalars['ID']>>;
  name?: Maybe<Scalars['String']>;
  state?: Maybe<ItemState>;
  deleted?: Maybe<Scalars['Boolean']>;
};

export type Query = {
  __typename?: 'Query';
  me?: Maybe<User>;
};

export type SendOperationsResponse = {
  __typename?: 'SendOperationsResponse';
  success: Scalars['Boolean'];
  message?: Maybe<Scalars['String']>;
};

export type Subscription = {
  __typename?: 'Subscription';
  campOperationAdded?: Maybe<Operation>;
};


export type SubscriptionCampOperationAddedArgs = {
  campId: Scalars['ID'];
};

export type SynchronizeResponse = {
  __typename?: 'SynchronizeResponse';
  status: SyncStatus;
  updatedOps?: Maybe<Array<Operation>>;
  campId?: Maybe<Scalars['ID']>;
};

export enum SyncStatus {
  ALL_GOOD = 'ALL_GOOD',
  RETRY = 'RETRY',
  NEED_UPDATE = 'NEED_UPDATE'
}


export type User = {
  __typename?: 'User';
  id: Scalars['ID'];
  username: Scalars['String'];
  name: Scalars['String'];
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type LegacyStitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type NewStitchingResolver<TResult, TParent, TContext, TArgs> = {
  selectionSet: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type StitchingResolver<TResult, TParent, TContext, TArgs> = LegacyStitchingResolver<TResult, TParent, TContext, TArgs> | NewStitchingResolver<TResult, TParent, TContext, TArgs>;
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Query: ResolverTypeWrapper<{}>;
  User: ResolverTypeWrapper<User>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Mutation: ResolverTypeWrapper<{}>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  OperationInput: OperationInput;
  Date: ResolverTypeWrapper<Scalars['Date']>;
  ItemState: ItemState;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  SynchronizeResponse: ResolverTypeWrapper<SynchronizeResponse>;
  SyncStatus: SyncStatus;
  Operation: ResolverTypeWrapper<Operation>;
  LoginResponse: ResolverTypeWrapper<LoginResponse>;
  Camp: ResolverTypeWrapper<Camp>;
  List: ResolverTypeWrapper<List>;
  Item: ResolverTypeWrapper<Item>;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  Subscription: ResolverTypeWrapper<{}>;
  SendOperationsResponse: ResolverTypeWrapper<SendOperationsResponse>;
  CampUpdateResponse: ResolverTypeWrapper<CampUpdateResponse>;
  Member: ResolverTypeWrapper<Member>;
  CacheControlScope: CacheControlScope;
  Upload: ResolverTypeWrapper<Scalars['Upload']>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Query: {};
  User: User;
  ID: Scalars['ID'];
  String: Scalars['String'];
  Mutation: {};
  Int: Scalars['Int'];
  OperationInput: OperationInput;
  Date: Scalars['Date'];
  Boolean: Scalars['Boolean'];
  SynchronizeResponse: SynchronizeResponse;
  Operation: Operation;
  LoginResponse: LoginResponse;
  Camp: Camp;
  List: List;
  Item: Item;
  Float: Scalars['Float'];
  Subscription: {};
  SendOperationsResponse: SendOperationsResponse;
  CampUpdateResponse: CampUpdateResponse;
  Member: Member;
  Upload: Scalars['Upload'];
}>;

export type CampResolvers<ContextType = any, ParentType extends ResolversParentTypes['Camp'] = ResolversParentTypes['Camp']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  lists?: Resolver<Array<ResolversTypes['List']>, ParentType, ContextType>;
  revision?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CampUpdateResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['CampUpdateResponse'] = ResolversParentTypes['CampUpdateResponse']> = ResolversObject<{
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface DateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Date'], any> {
  name: 'Date';
}

export type ItemResolvers<ContextType = any, ParentType extends ResolversParentTypes['Item'] = ResolversParentTypes['Item']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  assignedTo?: Resolver<Maybe<Array<ResolversTypes['Int']>>, ParentType, ContextType>;
  state?: Resolver<ResolversTypes['ItemState'], ParentType, ContextType>;
  position?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  deleted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ListResolvers<ContextType = any, ParentType extends ResolversParentTypes['List'] = ResolversParentTypes['List']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  items?: Resolver<Array<ResolversTypes['Item']>, ParentType, ContextType>;
  position?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type LoginResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['LoginResponse'] = ResolversParentTypes['LoginResponse']> = ResolversObject<{
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  camps?: Resolver<Array<ResolversTypes['Camp']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MemberResolvers<ContextType = any, ParentType extends ResolversParentTypes['Member'] = ResolversParentTypes['Member']> = ResolversObject<{
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  userId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  role?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  deleted?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  synchronize?: Resolver<ResolversTypes['SynchronizeResponse'], ParentType, ContextType, RequireFields<MutationSynchronizeArgs, 'campId' | 'opIndex'>>;
  login?: Resolver<Maybe<ResolversTypes['LoginResponse']>, ParentType, ContextType, RequireFields<MutationLoginArgs, never>>;
}>;

export type OperationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Operation'] = ResolversParentTypes['Operation']> = ResolversObject<{
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  campId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  listId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  itemId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  itemIds?: Resolver<Maybe<Array<ResolversTypes['ID']>>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  state?: Resolver<Maybe<ResolversTypes['ItemState']>, ParentType, ContextType>;
  deleted?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  me?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
}>;

export type SendOperationsResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['SendOperationsResponse'] = ResolversParentTypes['SendOperationsResponse']> = ResolversObject<{
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SubscriptionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = ResolversObject<{
  campOperationAdded?: SubscriptionResolver<Maybe<ResolversTypes['Operation']>, "campOperationAdded", ParentType, ContextType, RequireFields<SubscriptionCampOperationAddedArgs, 'campId'>>;
}>;

export type SynchronizeResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['SynchronizeResponse'] = ResolversParentTypes['SynchronizeResponse']> = ResolversObject<{
  status?: Resolver<ResolversTypes['SyncStatus'], ParentType, ContextType>;
  updatedOps?: Resolver<Maybe<Array<ResolversTypes['Operation']>>, ParentType, ContextType>;
  campId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface UploadScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Upload'], any> {
  name: 'Upload';
}

export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  username?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = any> = ResolversObject<{
  Camp?: CampResolvers<ContextType>;
  CampUpdateResponse?: CampUpdateResponseResolvers<ContextType>;
  Date?: GraphQLScalarType;
  Item?: ItemResolvers<ContextType>;
  List?: ListResolvers<ContextType>;
  LoginResponse?: LoginResponseResolvers<ContextType>;
  Member?: MemberResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Operation?: OperationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  SendOperationsResponse?: SendOperationsResponseResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  SynchronizeResponse?: SynchronizeResponseResolvers<ContextType>;
  Upload?: GraphQLScalarType;
  User?: UserResolvers<ContextType>;
}>;


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = any> = Resolvers<ContextType>;
