/* eslint-disable no-param-reassign */

const paginate = (schema) => {
  /**
   * @typedef {Object} QueryResult
   * @property {Document[]} results - Results found
   * @property {number} page - Current page
   * @property {number} limit - Maximum number of results per page
   * @property {number} totalPages - Total number of pages
   * @property {number} totalResults - Total number of documents
   */
  /**
   * Query for documents with pagination
   * @param {Object} [filter] - Query filter
   * @param {Object} [options] - Query options
   * @param {string} [options.sortBy] - Sorting criteria using the format: sortField:(desc|asc). Multiple sorting criteria should be separated by commas (,)
   * @param {number} [options.limit] - Maximum number of results per page (default = 10)
   * @param {number} [options.page] - Current page (default = 1)
   * @returns {Promise<QueryResult>}
   */
  if (!schema.statics) {
    schema.statics = {};
  }

  schema.statics.paginate = async function (filter, options) {
    const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
    const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
    const offset = (page - 1) * limit;

    let query = schema.queryBuilder.clone();

    // Apply sorting
    if (options.sortBy) {
      options.sortBy.split(',').forEach((sortOption) => {
        const [field, order] = sortOption.split(':');
        query = query.orderBy(field, order);
      });
    } else {
      query = query.orderBy(`${schema.tableName}.created_at`);
    }

    // Apply filter conditions if any
    if (filter) {
      query = query.where(filter);
    }

    // Get total count
    const countQuery = query.clone();
    const totalResults = await countQuery
      .count(`${schema.tableName}.id as count`)
      .first()
      .then((r) => r.count);

    // Get paginated results
    const results = await query.limit(limit).offset(offset);

    const totalPages = Math.ceil(totalResults / limit);

    return {
      results,
      page,
      limit,
      totalPages,
      totalResults,
    };
  };
};

module.exports = paginate;
