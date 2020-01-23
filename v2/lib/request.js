const parseCookies = function(cookies) {
  const cookieArr = cookies.split('; ');
  const cookieObj = cookieArr.reduce((cookiesObj, cookie) => {
    const [key, value] = cookie.split('=');
    cookiesObj[key] = value;
    return cookiesObj;
  }, {});
  return cookieObj;
};

const seprateHeadersAndBody = function(headerAndBody) {
  const bodyIndex = headerAndBody.findIndex(text => text === '');
  const headers = headerAndBody.slice(0, bodyIndex);
  const body = headerAndBody.slice(bodyIndex + 1).join('\n');
  return { headers, body };
};

const parseHeaders = function(headers) {
  const headersObj = headers.reduce((headersObj, header) => {
    const headerParts = header.split(': ');
    const headerName = headerParts[0];
    const headerValue = headerParts[1];
    headersObj[headerName] = headerValue;
    return headersObj;
  }, {});
  return headersObj;
};

const parseQueryValue = function(value) {
  return value.split('+').join(' ');
};

const parserQuery = function(queryText) {
  if (queryText === '') return {};
  const info = queryText.split('?');
  const pairs = info[0].split('&');

  const query = pairs.reduce((query, pair) => {
    const [key, value] = pair.split('=');
    query[key] = parseQueryValue(value);
    return query;
  }, {});

  return query;
};

class Request {
  constructor(method, path, headers, query, cookies) {
    this.method = method;
    this.path = path;
    this.headers = headers;
    this.query = query;
    this.cookies = cookies;
  }

  get details() {
    return {
      method: this.method,
      path: this.path,
      headers: this.headers,
      query: this.query,
      cookies: this.cookies
    };
  }

  static parse(requestText) {
    const [req, ...headerAndBody] = requestText.split('\r\n');
    const [method, path, protocol] = req.split(' ');
    const { headers, body } = seprateHeadersAndBody(headerAndBody);
    const headersObj = parseHeaders(headers);
    const cookies = headersObj['Cookie']
      ? parseCookies(headersObj['Cookie'])
      : {};
    const query = parserQuery(body);
    const request = new Request(method, path, headersObj, query, cookies);
    return request;
  }
}

module.exports = {
  Request
};
