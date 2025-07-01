const express = require('express');
const request = require('supertest');
const fs = require('fs');
const itemsRouter = require('../routes/items');

const testItems = [
  { id: 1, name: 'Test Item 1', category: 'Test Category', price: 10.99 },
  { id: 2, name: 'Another Item', category: 'Test Category', price: 20.50 },
  { id: 3, name: 'Different Item', category: 'Another Category', price: 15.75 },
];

// Mock fs module
jest.mock('fs', () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  promises: {
    readFile: jest.fn().mockResolvedValue(JSON.stringify(testItems)),
    writeFile: jest.fn().mockResolvedValue(undefined),
  },
}));

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/items', itemsRouter);
  return app;
};

describe('Items API', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = createTestApp();
    fs.promises.readFile.mockResolvedValue(JSON.stringify(testItems));
  });

  describe('GET /api/items', () => {
    it('should return all items with default pagination', async () => {
      const response = await request(app).get('/api/items');
      
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        items: expect.any(Array),
        total: 3,
        page: 1,
        limit: 10,
        hasMore: false,
      });
    });

    it('should return paginated results with custom page and limit', async () => {
      const response = await request(app).get('/api/items?page=1&limit=2');
      
      expect(response.status).toBe(200);
      expect(response.body.items).toHaveLength(2);
      expect(response.body).toMatchObject({
        page: 1,
        limit: 2,
        hasMore: true,
        total: 3,
      });
    });

    it('should filter items by search term', async () => {
      const response = await request(app).get('/api/items?search=another');
      
      expect(response.status).toBe(200);
      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].name).toBe('Another Item');
    });
  });

  describe('GET /api/items/:id', () => {
    it('should return a single item by id', async () => {
      const response = await request(app).get('/api/items/1');
      
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject(testItems[0]);
    });

    it('should return 404 for non-existent item', async () => {
      // Mock the error handling middleware
      const errorHandler = (err, req, res, next) => {
        res.status(err.status || 500).json({
          error: {
            message: err.message
          }
        });
      };
      
      // Create a test app with the error handler
      const testApp = createTestApp();
      testApp.use(errorHandler);
      
      const response = await request(testApp).get('/api/items/999');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('message');
      expect(response.body.error.message.toLowerCase()).toContain('not found');
    });
  });

  describe('POST /api/items', () => {
    const newItem = {
      name: 'New Test Item',
      category: 'Test Category',
      price: 29.99,
    };

    it('should create a new item', async () => {
      const response = await request(app)
        .post('/api/items')
        .send(newItem);
      
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject(newItem);
      expect(response.body).toHaveProperty('id');
      expect(fs.promises.writeFile).toHaveBeenCalled();
    });

    it('should validate item data - missing required fields', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.some(e => e.field === 'name')).toBe(true);
      expect(response.body.errors.some(e => e.field === 'category')).toBe(true);
      expect(response.body.errors.some(e => e.field === 'price')).toBe(true);
    });

    it('should validate item data - invalid price', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({
          name: 'Invalid Price',
          category: 'Test',
          price: -10
        });
      
      expect(response.status).toBe(400);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ 
            field: 'price',
            message: 'Price must be a positive number'
          })
        ])
      );
    });

    it('should validate item data - invalid name length', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({
          name: 'A', // Too short
          category: 'Test',
          price: 10
        });
      
      expect(response.status).toBe(400);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ 
            field: 'name',
            message: 'Name must be at least 2 characters'
          })
        ])
      );
    });
  });
});
