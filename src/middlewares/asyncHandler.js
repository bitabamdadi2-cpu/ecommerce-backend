// جلوگیری از تکرار try/catch در تمام کنترلرهای async
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
