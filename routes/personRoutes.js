import { Router } from "express";
import { addPerson, findPerson } from "../controllers/personController.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = Router();

router.post("/add", upload.array("photo", 1), addPerson);
router.post("/find", upload.array("photo", 1), findPerson);

export default { router };
