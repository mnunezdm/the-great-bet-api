const chalk = require('chalk');
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
    title: { type: GraphQLString, description: 'Milestone title' },
    description: {
      type: GraphQLString,
      description: 'Milestone description',
    },
    status: {
      type: StatusSchema,
      description: 'Milestone status',
    },
    completedDate: {
      type: GraphQLTimestamp,
      description: 'Completion date of the milestone in epoch format',
      extensions: {
        joinMonster: {
          sqlColumn: 'completed_date',
        },
      },
    },
    startedDate: {
      type: GraphQLTimestamp,
      description: 'Started date of the milestone in epoch format',
      extensions: {
        joinMonster: {
          sqlColumn: 'started_date',
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
        picklistValues: {
          notstarted: 'notstarted',
          inprogress: 'inprogress',
          completed: 'completed',
        },
      },
      completedDate: {
        type: Date,
        sqlField: 'completed_date',
        insertable: true,
        serializable: true,
      },
      startedDate: {
        type: Date,
        sqlField: 'started_date',
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

  get starteddDate() {
    return this._starteddDate;
  }
  set starteddDate(starteddDate) {
    this._starteddDate = starteddDate;
  }

  async updateStatus(db, newStatus) {
    console.log(
      chalk.dim`[info] Chaning milestone with id ${this.id} and status ${this.status} to ${newStatus}`,
    );

    if (!Milestone.fields.status.picklistValues[newStatus]) {
      throw new InvalidStatusError(`Invalid status value '${newStatus}'`);
    }

    if (this.status === newStatus) {
      throw new InvalidStatusError('Trying to change to actual status');
    }

    if (
      newStatus === 'notstarted' ||
      (this.status === 'completed' && newStatus === 'inprogress')
    ) {
      throw new InvalidStatusError('Cannot go back to previous status');
    }

    if (newStatus === 'completed' && this.status !== 'inprogress') {
      throw new InvalidStatusError('You have to start before complete');
    }

    if (this.id > 0) {
      const previousMilestone = await this.constructor.fromId(db, this.id - 1);

      if (previousMilestone.status !== 'completed') {
        throw new InvalidStatusError('You have to finish previous milestone');
      }
    }

    this.status = newStatus;
    const timestampField =
      newStatus === 'inprogress' ? 'startedDate' : 'completedDate';
    this[timestampField] = new Date();

    await this.update(db, ['status', timestampField]);
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

class InvalidStatusError extends Error {}

module.exports = {
  MilestoneSchema,
  Milestone,
};
