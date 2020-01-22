const parseRequest = function(request, address, port) {
  const [req, ...headerAndBody] = request.split('\n');
  const [method, path, protocol] = req.split(' ');
  const { headers, body } = seprateHeadersAndBody(headerAndBody);

  const headersObj = headers.reduce((headersObj, header) => {
    const headerParts = header.split(': ');
    const headerName = headerParts[0];
    const headerValue = headerParts[1].replace('\r', '');
    headersObj[headerName] = headerValue;
    return headersObj;
  }, {});

  return {
    url: `${address}${path}`,
    method,
    path,
    protocol,
    headersObj,
    body,
    port,
    host: address
  };
};

const seprateHeadersAndBody = function(headerAndBody) {
  const bodyIndex = headerAndBody.findIndex(text => text === '\r');
  const headers = headerAndBody.slice(0, bodyIndex);
  const body = headerAndBody.slice(bodyIndex + 1);
  return { headers, body };
};

module.exports = {
  parseRequest
};
