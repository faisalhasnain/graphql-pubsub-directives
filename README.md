### graphql-pubsub-directives

Attempt to automate GraphQL subscriptions for mutations with directives

```graphql

directive @publish(to: String!) on FIELD_DEFINITION
directive @subscribe on FIELD_DEFINITION

type Contact {
  name: String!
}

type Query {
  getContacts: [Contact!]!
}

type Mutation {
  addContact(name: String!): Contact @publish(to: "addedContact")
}

type Subscription {
  addedContact: Contact @subscribe
}

```