// server/routes/auth.js
import express from 'express';
import asyncHandler from '../../utils/asyncHandler.js';
import {
  refreshAccessToken,
  validateRefresh,
  handleValidation,
} from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/refresh', validateRefresh, handleValidation, asyncHandler(refreshAccessToken));

export default router;
