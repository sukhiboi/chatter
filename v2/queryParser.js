const parseQueryValue = function(value) {
  return value.split('+').join(' ');
};

const parserQuery = function(queryText) {
  const info = queryText.split('?');
  const pairs = info[0].split('&');

  const query = pairs.reduce((query, pair) => {
    const [key, value] = pair.split('=');
    query[key] = parseQueryValue(value);
    return query;
  }, {});

  return query;
};

module.exports = {
    parserQuery
};
