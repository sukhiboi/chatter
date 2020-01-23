const statusCodeLookup = {
  200: 'HTTP 1.1 200 OK',
  404: 'HTTP 1.1 404 File Not FOund'
};

const getHeadersAsString = function(headers) {
  let headersAsString = '';
  headers.forEach(header => {
    headersAsString += `${header.name}: ${header.value}\r\n`;
  });
  return headersAsString;
};

class Response {
  constructor(statusCode, content) {
    this.statusCode = statusCode;
    this.body = content || '';
    this.contentLength = this.body.length || 0;
    this.headers = [{ name: 'Content-Length', value: this.contentLength }];
  }

  addHeader(name, value) {
    this.headers.push({
      name,
      value
    });
  }

  addCookie(cookie) {
    const { name, value } = cookie;
    this.headers.push({
      name: 'Set-Cookie',
      value: `${name}=${value}; SameSite=Strict`
    });
  }

  get asString() {
    const response = statusCodeLookup[this.statusCode];
    const headers = getHeadersAsString(this.headers);
    return `${response}\n${headers}\r\n${this.body}\r\n`;
  }
}

module.exports = {
  Response
};
