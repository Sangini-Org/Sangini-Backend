exports.getPagination = (page, offlimit) => {
    const limit = offlimit ? +offlimit : 5;
    const offset = page ? (page - 1) * limit : 0;
    return { limit, offset };
  };
  
exports.getPagingData = (data, page, limit) => {
    const { count: totalItems, rows: users } = data;
    const currentPage = page ? +page : 0;
    const totalPages = Math.ceil(totalItems / limit);
    return { totalItems, users, totalPages, currentPage };
  };