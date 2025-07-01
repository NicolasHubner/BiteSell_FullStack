const { itemSchema } = require('../schemas/post-body');

// Validation middleware
// Validate Body to post item
//If was a project with more complexity, we could create a class to inject each item from the schema
//And validate each item
const validateBodyPost = (req, res, next) => {
  try {
    const result = itemSchema.safeParse(req.body);
    
    if (!result.success) {
      const formattedErrors = result.error.errors.map(err => ({
        field: err.path[0],
        message: err.message
      }));
      
      return res.status(400).json({ 
        errors: formattedErrors
      });
    }
    
    req.validatedData = result.data;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {validateBodyPost};