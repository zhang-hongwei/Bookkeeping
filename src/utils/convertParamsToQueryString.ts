const convertParamsToQueryString = (params: any): string => {
  if (!params) return "";
  const queryString = Object.keys(params)
    .filter((key) => params[key] || params[key] === 0 || params[key] === false)
    .map((key) => key + "=" + params[key])
    .join("&");
  return queryString ? `?${queryString}` : "";
};

export default convertParamsToQueryString;
