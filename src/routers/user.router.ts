import express from "express";
import {
  createUserController,
  getSelfController,
  getUserByIdController,
} from "../controller/user.controller";
import authMiddleware from "../utils/auth.middleware";
const router = express.Router();

router.use(
  express.json({
    strict: true,
    verify: (_req, _res, buf) => {
      try {
        JSON.parse(buf.toString());
      } catch (e) {
        throw new Error("INVALID_JSON");
      }
    },
  })
);

router.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (err.message === "INVALID_JSON") {
      return res.status(400).json({ error: "Request body must be valid JSON" });
    }
    next(err);
  }
);

router.post("/", createUserController);

router.use(authMiddleware);
router.get("/me", getSelfController);
router.get("/:id", getUserByIdController);
export default router;
