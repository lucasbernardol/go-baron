import { Output } from 'paging-util';

export type PaginationOptions = Partial<Output>;

/** @function paginationSnakeCase  */
export function paginationSnakeCase({ pagination }: PaginationOptions) {
  return {
    records: pagination.records,
    total_pages: pagination.totalPages,
    current_page: pagination.currentPage,
    limit: pagination.limit,
    first_page: pagination.firstPage,
    is_last: pagination.isLastPage,
    next: pagination.next,
    previous: pagination.previous,
    has_next: pagination.hasNext,
    has_previous: pagination.hasPrevious,
    length: pagination.length,

    array: {
      first_index: pagination.firstIndex,
      last_index: pagination.lastIndex,
    },
  };
}
