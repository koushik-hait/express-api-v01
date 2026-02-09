/**
 * Pagination and filtering utilities
 */

/**
 * Get pagination parameters from request query
 */
export const getPaginationParams = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

/**
 * Build pagination metadata
 */
export const buildPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);

  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

/**
 * Get sort parameters from request query
 * @param {object} query - Request query object
 * @param {string[]} allowedFields - Fields that can be sorted
 * @param {string} defaultField - Default sort field
 * @param {string} defaultOrder - Default sort order ('asc' or 'desc')
 */
export const getSortParams = (
  query,
  allowedFields = ["createdAt"],
  defaultField = "createdAt",
  defaultOrder = "desc",
) => {
  const sortField = allowedFields.includes(query.sortBy)
    ? query.sortBy
    : defaultField;

  const sortOrder = ["asc", "desc"].includes(query.sortOrder?.toLowerCase())
    ? query.sortOrder.toLowerCase()
    : defaultOrder;

  return { sortField, sortOrder };
};

/**
 * Build filter object from query parameters
 * @param {object} query - Request query object
 * @param {object} filterConfig - Configuration for filters
 */
export const buildFilters = (query, filterConfig) => {
  const filters = {};

  for (const [key, config] of Object.entries(filterConfig)) {
    if (query[key] !== undefined && query[key] !== "") {
      const value = query[key];

      switch (config.type) {
        case "number":
          filters[key] = parseInt(value);
          break;
        case "boolean":
          filters[key] = value === "true" || value === "1";
          break;
        case "array":
          filters[key] = Array.isArray(value) ? value : value.split(",");
          break;
        case "date":
          filters[key] = new Date(value);
          break;
        default:
          filters[key] = value;
      }
    }
  }

  return filters;
};

/**
 * Get search parameter from query
 */
export const getSearchParam = (query, searchFields = ["name"]) => {
  const search = query.search || query.q || "";
  return { search, searchFields };
};
