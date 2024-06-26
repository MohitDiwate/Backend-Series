const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };

// const asyncHandler = (requestHandler)=> async(req,res,next)=>{
//   try {
//     await requestHandler(req,res,next);
//   } catch (error) {
//     return res.status(error.statusCode||500).json({
//       status:false,
//       message:error.message
//     })
//   }
// }

// export {asyncHandler}
