const {
  GraphQLString,
  GraphQLObjectType,
  GraphQLEnumType,
  GraphQLInt,
} = require('graphql');
const { GraphQLTimestamp } = require('../graphql/types/timestamp');
const { BaseObject } = require('./dbs/base');

const StatusSchema = new GraphQLEnumType({
  name: 'Status',
  values: {
    notstarted: {
      value: 'notstarted',
    },
    inprogress: {
      value: 'inprogress',
    },
    completed: {
      value: 'completed',
    },
  },
});

const MilestoneSchema = new GraphQLObjectType({
  name: 'Milestone',
  extensions: {
    joinMonster: {
      sqlTable: 'milestone',
      uniqueKey: 'id',
    },
  },
  fields: () => ({
    id: {
      type: GraphQLInt,
      description: 'Id of the milestone',
    },
    title: { type: GraphQLString, description: 'Title for the milestone' },
    description: {
      type: GraphQLString,
      description: 'Description for the milestone',
    },
    status: {
      type: StatusSchema,
      description: 'Current status for the milestone',
    },
    completedDate: {
      type: GraphQLTimestamp,
      description: 'Completion date for the current milestone in epoch format',
      extensions: {
        joinMonster: {
          sqlColumn: 'completed_date',
        },
      },
    },
  }),
});

class Milestone extends BaseObject {
  static TABLE = 'milestone';

  static get fields() {
    return {
      id: {
        type: Number,
        serializable: true,
      },
      title: {
        type: String,
        insertable: true,
        serializable: true,
      },
      description: {
        type: String,
        insertable: true,
        serializable: true,
      },
      status: {
        type: String,
        insertable: true,
        serializable: true,
      },
      completedDate: {
        type: Number,
        sqlField: 'completed_date',
        insertable: true,
        serializable: true,
      },
    };
  }

  static getValue({ header, value }) {
    let parsed = value;
    if (Milestone.fields[header].type === Boolean) {
      parsed = value === 'true';
    } else if (value === '') {
      parsed = null;
    }
    return parsed;
  }

  get id() {
    return this._id;
  }
  set id(id) {
    this._id = id;
  }

  get title() {
    return this._title;
  }
  set title(title) {
    this._title = title;
  }

  get description() {
    return this._description;
  }
  set description(description) {
    this._description = description;
  }

  get status() {
    return this._status;
  }
  set status(status) {
    this._status = status;
  }

  get completedDate() {
    return this._completedDate;
  }
  set completedDate(completedDate) {
    this._completedDate = completedDate;
  }

  /**
   * @returns {Milestone}
   */
  static fromCsvRow(data) {
    const milestone = new Milestone();
    Object.assign(milestone, data);
    return milestone;
  }
}

module.exports = {
  MilestoneSchema,
  Milestone,
};
