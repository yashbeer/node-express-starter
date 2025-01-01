const { toJSON } = require('../../../../src/models/plugins');

describe('toJSON plugin', () => {
  it('should replace _id with id', () => {
    const mockData = { _id: 1, name: 'test' };
    const schema = {
      paths: {},
      options: {},
    };

    toJSON(schema);
    const transformed = { ...mockData };
    schema.options.toJSON.transform(null, transformed, {});

    expect(transformed).not.toHaveProperty('_id');
    expect(transformed).toHaveProperty('id', '1');
  });

  it('should remove __v', () => {
    const mockData = { _id: 1, __v: 0, name: 'test' };
    const schema = {
      paths: {},
      options: {},
    };

    toJSON(schema);
    const transformed = { ...mockData };
    schema.options.toJSON.transform(null, transformed, {});

    expect(transformed).not.toHaveProperty('__v');
  });

  it('should remove createdAt and updatedAt', () => {
    const mockData = {
      _id: 1,
      name: 'test',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const schema = {
      paths: {},
      options: {},
    };

    toJSON(schema);
    const transformed = { ...mockData };
    schema.options.toJSON.transform(null, transformed, {});

    expect(transformed).not.toHaveProperty('createdAt');
    expect(transformed).not.toHaveProperty('updatedAt');
  });

  it('should remove any path set as private', () => {
    const mockData = {
      _id: 1,
      public: 'some public value',
      private: 'some private value',
    };
    const schema = {
      paths: {
        public: { options: {} },
        private: { options: { private: true } },
      },
      options: {},
    };

    toJSON(schema);
    const transformed = { ...mockData };
    schema.options.toJSON.transform(null, transformed, {});

    expect(transformed).not.toHaveProperty('private');
    expect(transformed).toHaveProperty('public');
  });

  it('should remove any nested paths set as private', () => {
    const mockData = {
      _id: 1,
      public: 'some public value',
      nested: {
        private: 'some private value',
      },
    };
    const schema = {
      paths: {
        public: { options: {} },
        'nested.private': { options: { private: true } },
      },
      options: {},
    };

    toJSON(schema);
    const transformed = { ...mockData };
    schema.options.toJSON.transform(null, transformed, {});

    expect(transformed.nested).not.toHaveProperty('private');
    expect(transformed).toHaveProperty('public');
  });
});
