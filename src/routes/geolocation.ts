import { Request, Response } from 'express';

export default async (req: Request, res: Response) => {
  console.log(req.body);
  res.send(200);
};
