import { Router, Request, Response } from "express"

const router = Router()

router.get("/identities", (req: Request, res: Response) => {
    res.json({
        message: "Access granted to admin identities API",
        user: req.user,
    })
})

export default router
