const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const { validateBodyPost } = require('../middleware/validation-post');
const DATA_PATH = path.join(__dirname, '../../../data/items.json');


// Utility to read data using async/await
async function readData() {
  try {
    const raw = await fs.promises.readFile(DATA_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading file:', error);
    throw error;
  }
}

// GET /api/items
router.get('/', async (req, res, next) => {
  try {
    const data = await readData();
    
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const search = (req.query.search || '').toLowerCase();
    
    let results = data;
    if (search) {
      results = data.filter(item => 
        item.name.toLowerCase().includes(search)
      );
    }
    
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = results.slice(start, end);
    
    res.json({
      items: paginated,
      total: results.length,
      page,
      limit,
      hasMore: end < results.length
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/items/:id
router.get('/:id', async (req, res, next) => {
  try {
    const data = await readData();
    const item = data.find(i => i.id === parseInt(req.params.id));
    if (!item) {
      const err = new Error('Item not found');
      err.status = 404;
      throw err;
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// POST /api/items
router.post('/', validateBodyPost, async (req, res, next) => {
  try {
    const item = req.body;

    const data = await readData();
    item.id = Date.now();
    data.push(item);
    await fs.promises.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

module.exports = router;