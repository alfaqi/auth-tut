import express from "express";

import {
  magicLogin,
  magicRequest,
} from "../controllers/passwordless.controller.js";

const router = express.Router();

// STEP 1 → User requests login link
router.post("/magic-request", magicRequest);

// STEP 2 → User clicks magic link
router.get("/magic-login", magicLogin);

export default router;
