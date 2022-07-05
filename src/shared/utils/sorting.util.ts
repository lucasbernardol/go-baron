type OrderField = 'asc' | 'desc';

type SortingOptions = {
  sort?: string | any;
  order?: OrderField | any;
};

type SortingOutput = {
  sort_by: string;
  order_by: OrderField;
};

/** @function sortingUtil */
export function sortingUtil(
  options: SortingOptions = {},
  defualtSort?: string
) {
  const { sort = defualtSort || 'hits', order = 'asc' } = options;

  const sorting: SortingOutput = {
    // Fields: "hits", "created_at", "updated_at", etc.
    sort_by: sort,
    order_by: order,
  };

  return sorting;
}

/** @function descAndAscToDecimal */
export function descAndAscToDecimal(match: string): number {
  return match === 'desc' ? -1 : 1;
}
