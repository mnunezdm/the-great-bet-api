const { Milestone } = require('../src/models/milestone');

const resetMocks = () => {
  jest.clearAllMocks();
};

jest.mock('pg', () => ({
  Client: jest.fn(() => ({
    query: jest.fn(),
  })),
}));

describe('user tests fields', () => {
  it('check insertable fields', () => {
    expect.assertions(2);
    const milestone = new Milestone();

    expect(milestone.insertFields).not.toContain('id');
    expect(milestone.insertFields.length).toBeLessThan(
      Object.keys(Milestone.fields).length,
    );

    resetMocks();
  });

  it('queryable fields', () => {
    expect.assertions(2);
    const milestone = new Milestone();
    expect(milestone.queryFields).toContain('id');
    expect(milestone.queryFields).toHaveLength(
      Object.keys(Milestone.fields).length,
    );
  });

  it('from csv row', () => {
    expect.assertions(6);
    const milestone = Milestone.fromCsvRow({
      title: 'Hello',
      description: 'This is the description',
      status: 'notstarted',
      completedDate: null,
    });
    expect(milestone).toHaveProperty('id', undefined);
    expect(milestone).toHaveProperty('title', 'Hello');
    expect(milestone).toHaveProperty('description', 'This is the description');
    expect(milestone).toHaveProperty('status', 'notstarted');
    expect(milestone).toHaveProperty('completedDate', null);
    expect(milestone).toHaveProperty('constructor', Milestone);
  });
});
