import { NextFunction, Request, Response } from "express";

function TryCatch(handler: any) {
  return function (req: Request, res: Response, next: NextFunction) {
    try {
      handler(req, res, next);
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        res.status(500).json({ success: false, message: error.message });
      }
    }
  };
}

export default TryCatch;
