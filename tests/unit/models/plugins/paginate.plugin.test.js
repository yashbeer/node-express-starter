const paginate = require('../../../../src/models/plugins/paginate.plugin');
const db = require('../../../../src/config/db');

describe('paginate plugin', () => {
  beforeAll(async () => {
    // Create test tables
    await db.schema.dropTableIfExists('tasks');
    await db.schema.dropTableIfExists('projects');

    await db.schema.createTable('projects', (table) => {
      table.increments('id');
      table.string('name').notNullable();
      table.timestamps(true, true);
    });

    await db.schema.createTable('tasks', (table) => {
      table.increments('id');
      table.string('name').notNullable();
      table.integer('project_id').unsigned().references('id').inTable('projects');
      table.timestamps(true, true);
    });
  });

  afterAll(async () => {
    // Drop test tables
    await db.schema.dropTableIfExists('tasks');
    await db.schema.dropTableIfExists('projects');
    await db.destroy();
  });

  afterEach(async () => {
    // Clear data after each test
    await db('tasks').del();
    await db('projects').del();
  });

  describe('paginate functionality', () => {
    test('should paginate results correctly', async () => {
      // Create test data
      const project = await db('projects')
        .insert({ name: 'Project One' })
        .returning(['id'])
        .then((rows) => rows[0]);

      await db('tasks').insert({ name: 'Task One', project_id: project.id });

      const schema = {
        tableName: 'tasks',
        queryBuilder: db('tasks'),
      };

      paginate(schema);
      const result = await schema.statics.paginate({}, { limit: 10, page: 1 });

      expect(result.results).toHaveLength(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
      expect(result.totalResults).toBe(1);
    });

    test('should sort results correctly', async () => {
      // Create test data
      const project = await db('projects')
        .insert({ name: 'Project One' })
        .returning(['id'])
        .then((rows) => rows[0]);

      await db('tasks').insert([
        { name: 'Task A', project_id: project.id },
        { name: 'Task B', project_id: project.id },
        { name: 'Task C', project_id: project.id },
      ]);

      const schema = {
        tableName: 'tasks',
        queryBuilder: db('tasks'),
      };

      paginate(schema);
      const result = await schema.statics.paginate(
        {},
        {
          sortBy: 'name:desc',
          limit: 10,
          page: 1,
        }
      );

      expect(result.results).toHaveLength(3);
      expect(result.results[0].name).toBe('Task C');
      expect(result.results[2].name).toBe('Task A');
    });

    test('should handle joins correctly', async () => {
      // Create test data
      const project = await db('projects')
        .insert({ name: 'Project One' })
        .returning(['id'])
        .then((rows) => rows[0]);

      await db('tasks').insert({ name: 'Task One', project_id: project.id });

      const schema = {
        tableName: 'tasks',
        queryBuilder: db('tasks').join('projects', 'tasks.project_id', '=', 'projects.id'),
      };

      paginate(schema);
      const result = await schema.statics.paginate(
        {},
        {
          limit: 10,
          page: 1,
        }
      );

      expect(result.results[0]).toHaveProperty('projectId', project.id);
      expect(result.totalResults).toBe(1);
    });
  });
});
