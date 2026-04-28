import { Router, type IRouter } from "express";
import healthRouter from "./health";
import userRouter from "./user";
import dramasRouter from "./dramas";
import episodesRouter from "./episodes";
import libraryRouter from "./library";

const router: IRouter = Router();

router.use(healthRouter);
router.use(userRouter);
router.use(dramasRouter);
router.use(episodesRouter);
router.use(libraryRouter);

export default router;
