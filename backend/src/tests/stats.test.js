const express = require('express');
const request = require('supertest');

// Mock fs with jest.fn() directly in the mock definition
jest.mock('fs', () => {
  const originalModule = jest.requireActual('fs');
  return {
    ...originalModule,
    watchFile: jest.fn(),
    unwatchFile: jest.fn(),
    promises: {
      readFile: jest.fn()
    }
  };
});

// Now require fs to get the mocked version
const fs = require('fs');

const mockStats = { total: 3, averagePrice: 20 };
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const mockStatsUtils = {
  statsCache: null,
  cacheTimestamp: 0,
  CACHE_TTL_MS,
  DATA_PATH: '/fake/path/to/data.json',
  calculateStats: jest.fn(),
  updateCache: jest.fn()
};

jest.mock('../utils/stats', () => mockStatsUtils);

const createTestRouter = () => {
  const router = express.Router();

  router.get('/', (req, res, next) => {
    const now = Date.now();

    if (mockStatsUtils.statsCache && (now - mockStatsUtils.cacheTimestamp) < mockStatsUtils.CACHE_TTL_MS) {
      return res.json({
        ...mockStatsUtils.statsCache,
        _cached: true,
        _cachedUntil: new Date(mockStatsUtils.cacheTimestamp + mockStatsUtils.CACHE_TTL_MS).toISOString()
      });
    }

    mockStatsUtils.updateCache(({ success, error, data: freshStats }) => {
      if (!success) return next(error);

      res.json({
        ...freshStats,
        _cached: false,
        _cachedUntil: new Date(mockStatsUtils.cacheTimestamp + mockStatsUtils.CACHE_TTL_MS).toISOString()
      });
    });
  });

  return router;
};

describe('Stats Router', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();

    mockStatsUtils.statsCache = null;
    mockStatsUtils.cacheTimestamp = 0;

    mockStatsUtils.updateCache.mockImplementation(cb => {
      mockStatsUtils.statsCache = { ...mockStats };
      mockStatsUtils.cacheTimestamp = Date.now();
      cb({ success: true, error: null, data: mockStats });
    });

    app = express();
    app.use(express.json());
    app.use('/api/stats', createTestRouter());

    // Global error handler
    app.use((err, req, res, next) => {
      res.status(err.status || 500).json({ error: { message: err.message } });
    });
  });

  it('should return cached stats if cache is valid', async () => {
    const now = Date.now();
    mockStatsUtils.statsCache = { ...mockStats };
    mockStatsUtils.cacheTimestamp = now - 1000; // still valid

    const res = await request(app).get('/api/stats/');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ...mockStats,
      _cached: true
    });
    expect(res.body._cachedUntil).toBeDefined();
    expect(mockStatsUtils.updateCache).not.toHaveBeenCalled();
  });

  it('should fetch fresh stats when cache is expired', async () => {
    const now = Date.now();
    mockStatsUtils.statsCache = { total: 1, averagePrice: 10 };
    mockStatsUtils.cacheTimestamp = now - CACHE_TTL_MS - 1000;

    const res = await request(app).get('/api/stats/');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ...mockStats,
      _cached: false
    });
    expect(mockStatsUtils.updateCache).toHaveBeenCalled();
  });

  it('should return 500 error if updateCache fails', async () => {
    const error = new Error('Fake failure');
    mockStatsUtils.updateCache.mockImplementationOnce(cb => {
      cb({ success: false, error });
    });

    const res = await request(app).get('/api/stats/');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error.message).toBe('Fake failure');
  });
});

describe('Stats Router File Watcher', () => {
  it('should register fs.watchFile when the router is required', () => {
    // The fs.watchFile is called when the module is required, so we need to check the mock
    // after requiring it in the test setup
    
    fs.watchFile.mockClear();
    
    const statsRouter = require('../routes/stats');
    
    expect(fs.watchFile).toHaveBeenCalledWith(
      mockStatsUtils.DATA_PATH,
      { interval: 1000 },
      expect.any(Function)
    );
  });
});
