const { z } = require('zod');

const itemSchema = z.object({
    name: z.string()
      .min(2, { message: 'Name must be at least 2 characters' })
      .max(100, { message: 'Name must be at most 100 characters' })
      .refine(val => val.trim().length > 0, { 
        message: 'Name is required' 
      }),
    category: z.string()
      .min(2, { message: 'Category must be at least 2 characters' })
      .max(50, { message: 'Category must be at most 50 characters' })
      .refine(val => val.trim().length > 0, {
        message: 'Category is required'
      }),
    price: z.number({
      required_error: 'Price is required',
      invalid_type_error: 'Price must be a number'
    }).positive({ message: 'Price must be a positive number' })
  });

module.exports = { itemSchema };