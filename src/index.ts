import express, {Request, Response} from "express";

const app = express()

app.get('/', (req: Request, res: Response) => {
  res.send('Hello world')
})

const port = Number(process.env.PORT) || 3000

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`)
})
