const omitDeepArrayWalk = (arr: any, key: string) =>
  arr.map((val: any): any => {
    if (Array.isArray(val)) return omitDeepArrayWalk(val, key);
    // eslint-disable-next-line no-use-before-define
    else if (typeof val === 'object') return omitDeep(val, key);
    return val;
  });

const omitDeep = (obj: Record<string, any>, key: string) => {
  const keys = Object.keys(obj);
  const newObj: any = {};
  keys.forEach(i => {
    if (i !== key) {
      const val = obj[i];
      if (val instanceof Date) newObj[i] = val;
      if (Array.isArray(val)) newObj[i] = omitDeepArrayWalk(val, key);
      else if (typeof val === 'object' && val !== null) {
        newObj[i] = omitDeep(val, key);
      } else newObj[i] = val;
    }
  });
  return newObj;
};

export default (
  data: Record<string, any>,
  key = '__typename'
): Record<string, any> => ({
  ...omitDeep(data, key),
});
