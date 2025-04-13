export default url => {
  let value = url;
  if (!/^(?:f|ht)tps?:\/\//.test(url)) {
    value = `http://${url}`;
  }
  return value?.replace("http://", "https://");
};
