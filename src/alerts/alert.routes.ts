//Route ki responsibility sirf HTTP path ko controller se map karna hai. Is file mein SQL, business logic ya database calls nahi honge.
import { Router } from "express";
import { getAlertsController } from "./alert.controller.js";


const router = Router();
router.get("/", getAlertsController);
export default router;


// Expected flow:
// HTTP Request
//       |
// GET /api/alerts
//       |
// alert.routes.ts
// Route matching
//       |
// alert.controller.ts
// HTTP handling
//       |
// alert-retrieval.service.ts
// PostgreSQL query