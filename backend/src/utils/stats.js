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

const updateCache = async (callback) => {
  try {
    const raw = await fs.promises.readFile(DATA_PATH, 'utf8');
    const items = JSON.parse(raw);
    statsCache = calculateStats(items);
    cacheTimestamp = Date.now();
    
    callback({
      success: true,
      error: null,
      data: statsCache
    });
  } catch (err) {
    callback({
      success: false,
      error: err,
      data: null
    });
  }
};

module.exports = { 
  calculateStats, 
  updateCache, 
  statsCache, 
  cacheTimestamp, 
  CACHE_TTL_MS,
  DATA_PATH 
};