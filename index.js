'use strict';

const { ApolloServer, SchemaDirectiveVisitor, gql } = require('apollo-server');
const { PubSub } = require('graphql-subscriptions');

const pubsub = new PubSub();

const contacts = [
  {
    name: 'Faisal Hasnain'
  },
  {
    name: 'Zarafshan Faisal'
  }
];

const typeDefs = gql`

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

`;

const resolvers = {
  Query: {
    getContacts: (parent, args, context) => {
      return contacts;
    }
  },
  Mutation: {
    addContact: (parent, args, context) => {
      contacts.push(args);
      return args;
    }
  }
};

class SubscribeDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    field.subscribe = () => pubsub.asyncIterator(field.name);
  }
}

class PublishDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { to } = this.args;
    const { resolve } = field;
    field.resolve = (...args) => {
      const data = resolve.apply(this, args);
      pubsub.publish(to, { [to]: data });
      return data;
    };
  }
}

const schemaDirectives = {
  publish: PublishDirective,
  subscribe: SubscribeDirective
};

const server = new ApolloServer({ typeDefs, resolvers, schemaDirectives });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
