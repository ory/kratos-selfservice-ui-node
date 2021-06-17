import { NextFunction, Request, Response } from 'express';

export default (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
      
    // Render the data using a view (e.g. Jade Template):
      res.render('cnetwork', {});
}