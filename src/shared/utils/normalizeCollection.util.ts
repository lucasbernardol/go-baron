type CollectionOptions = {
  toIdStartPosition?: boolean;
};

/**
 * @function normalizeCollection
 */
export function normalizeCollection<T>(
  collectionData: T,
  options: CollectionOptions = { toIdStartPosition: true }
): Partial<T> {
  const { toIdStartPosition } = options;

  const fieldsKeys = Object.keys(collectionData);

  const collectionNormalized = fieldsKeys.reduce((accumulator, key) => {
    const itemKey = key === '_id' ? 'id' : key;

    /**
     * Example: { _id: "g5e" } => { id: "g5e" }
     */
    return { ...accumulator, [itemKey]: collectionData[key] };
  }, {} as any);

  let collection: object = null;

  // "ID" is the first object key.
  if (toIdStartPosition) {
    const { id, ...fields } = collectionNormalized;

    collection = Object.assign({ id }, fields);
  }

  return collection;
}
