// Utility intentionally unused by routes (candidate should refactor)
const path = require('path');
const fs = require('fs');
const DATA_PATH = path.join(__dirname, '../../../data/items.json');
let statsCache = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache TTL

function calculateStats(items) {
  return {
    total: items.length,
    averagePrice: items.reduce((acc, cur) => acc + cur.price, 0) / items.length
  };
}

const updateCache = (callback) => {
  fs.readFile(DATA_PATH, (err, raw) => {
    if (err) {
      return callback({
        success: false,
        error: err,
        data: null
      });
    }
    
    try {
      const items = JSON.parse(raw);
      statsCache = calculateStats(items);
      cacheTimestamp = Date.now();
      
      callback({
        success: true,
        error: null,
        data: statsCache
      });
    } catch (parseErr) {
      callback({
        success: false,
        error: parseErr,
        data: null
      });
    }
  });
};

module.exports = { calculateStats, updateCache, DATA_PATH };