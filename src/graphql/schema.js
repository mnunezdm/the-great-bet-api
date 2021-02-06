const { GraphQLObjectType, GraphQLSchema, GraphQLList } = require('graphql');

const joinMonster = require('join-monster');

const { MilestoneSchema } = require('../models/milestone');

const query = db =>
  new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
      milestones: {
        type: new GraphQLList(MilestoneSchema),
        resolve: (parent, args, context, resolveInfo) =>
          joinMonster.default(resolveInfo, {}, sql => db.query(sql), {
            dialect: 'pg',
          }),
      },
    }),
  });

const schema = db => new GraphQLSchema({ query: query(db) });

module.exports = {
  schema,
};
