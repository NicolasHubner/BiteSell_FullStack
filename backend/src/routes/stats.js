const express = require('express');
const fs = require('fs');
const router = express.Router();
const { updateCache, DATA_PATH, statsCache, cacheTimestamp, CACHE_TTL_MS } = require('../utils/stats');


// Watch for file changes
fs.watchFile(DATA_PATH, { interval: 1000 }, () => {
  console.log('Data file changed, invalidating cache...');
  updateCache(({ success, error }) => {
    if (!success) console.error('Failed to update stats cache:', error);
  });
});

// GET /api/stats
router.get('/', (req, res, next) => {
  const now = Date.now();
  
  if (statsCache && (now - cacheTimestamp) < CACHE_TTL_MS) {
    return res.json({
      ...statsCache,
      _cached: true,
      _cachedUntil: new Date(cacheTimestamp + CACHE_TTL_MS).toISOString()
    });
  }
  
  // For first time and if isn't fresh, so recalculates and update the cache
  updateCache(({ success, error, data: freshStats }) => {
    if (!success) return next(error);
    
    res.json({
      ...freshStats,
      _cached: false,
      _cachedUntil: new Date(cacheTimestamp + CACHE_TTL_MS).toISOString()
    });
  });
});

module.exports = router;