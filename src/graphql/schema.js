const { GraphQLInt } = require('graphql');
const {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull,
} = require('graphql');

const joinMonster = require('join-monster');

const {
  MilestoneSchema,
  Milestone,
  StatusSchema,
} = require('../models/milestone');

const schema = db =>
  new GraphQLSchema({
    query: new GraphQLObjectType({
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
    }),
    mutation: new GraphQLObjectType({
      name: 'Mutation',
      fields: () => ({
        milestoneStatus: {
          type: MilestoneSchema,
          args: {
            id: { type: GraphQLNonNull(GraphQLInt) },
            status: { type: GraphQLNonNull(StatusSchema) },
          },
          resolve: async (parent, args, context, resolveInfo) => {
            if (!context.user) {
              throw new MissingAuthenticationError(
                'Need to be logged to perform mutations',
              );
            }

            await (await Milestone.fromId(db, args.id)).updateStatus(
              db,
              args.status,
            );

            return await joinMonster.default(
              resolveInfo,
              {},
              sql => db.query(sql),
              {
                dialect: 'pg',
              },
            );
          },
        },
      }),
    }),
  });

class MissingAuthenticationError extends Error {}

module.exports = {
  schema,
};
