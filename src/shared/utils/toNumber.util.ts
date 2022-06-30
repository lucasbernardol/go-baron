/**
 *  @function toNumber
 */
export const toNumber = (v: any, defaultValue: number) => {
  return Number(v) || defaultValue;
};
