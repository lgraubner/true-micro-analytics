const { send, createError } = require('micro');
const url = require('url');
const flatfiledb = require('flat-file-db');
const promise = require('promise');

// connect db
const flat = flatfiledb.sync('./data/analytics.db');

// promisify db methods
const db = {
  put: promise.denodeify(flat.put.bind(flat)),
  has: (key) => Promise.resolve(flat.has(key)),
  get: (key) => Promise.resolve(flat.get(key) || []),
  keys: () => Promise.resolve(flat.keys()),
};

/**
 * Get all view data.
 * @return {object} Contains view data
 */
const getAll = async () => {
  const keys = await db.keys();

  // map keys to view data
  return keys.reduce((data, key) => {
    data[key] = flat.get(key);
    return data;
  }, {});
}

/**
 * Push view into db
 * @param  {string}  key  Key or path
 * @param  {object}  view View data to be saved
 * @return {Promise}
 */
const pushView = async (key, view) => {
  // get current views
  const views = await db.get(key);
  // insert new view
  await db.put(key, views.concat([view]));
}

module.exports = async function (req, res) {
  // only allow get requests
  if (req.method !== 'GET') {
    throw createError(405, 'Method not supported');
  }

  // parse url parts
  const { pathname, query } = url.parse(req.url, true);

  // ignore favicon requests
  if (pathname === '/favicon.ico') {
    return;
  }

  if (pathname.length <= 1) {
    // no path present
    // get all views
    const views = await getAll();
    // return view data
    send(res, 200, views);
  } else {
    // get views for path
    const views = await db.get(pathname);

    if (query.count !== undefined) {
      // count query, return view count
      send(res, 200, { views: views.length });
    } else if (query.views !== undefined) {
      // views query, return path views
      send(res, 200, { views });
    } else {
      // track view, push to db
      await pushView(pathname, { ts: Date.now() });
      // return no content status
      send(res, 204);
    }
  }
};
