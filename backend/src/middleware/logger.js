// Extra logger middleware stub for candidate to enhance
const chalk = require('chalk');
const moment = require('moment');

module.exports = (req, res, next) => {
  const timestamp = moment().format('HH:mm:ss');
  const method = req.method.padEnd(2);
  
  //If its in production using .env we can use differents type of logs for development 
  //and production environment. Because logs on AWS don't accept colors
  let methodColor;
  switch(req.method) {
    case 'GET':
      methodColor = chalk.green.bold;
      break;
    case 'POST':
      methodColor = chalk.blue.bold;
      break;
    case 'PUT':
    case 'PATCH':
      methodColor = chalk.yellow.bold;
      break;
    case 'DELETE':
      methodColor = chalk.red.bold;
      break;
    default:
      methodColor = chalk.gray.bold;
  }
  
  console.log(
    chalk.gray(`[${timestamp}]`),
    methodColor(`${method}`),
    chalk.white(req.originalUrl)
  );
  
  next();
};