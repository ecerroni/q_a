const base64String = (text: string) =>
  window.btoa(unescape(encodeURIComponent(text)));

export default base64String;
