/**
 * Pagination Helpers
 */
export const calculatePaginationParams = (page: number, limit: number) => {
    const pageNumber = parseInt(page.toString());
    const limitResult = parseInt(limit.toString());
    const offset = (pageNumber - 1) * limitResult;

    return {
        pageNumber,
        limitResult,
        offset
    };
}