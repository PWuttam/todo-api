// server/routes/auth.js
import express from 'express';
import asyncHandler from '../../utils/asyncHandler.js';
import {
  refreshAccessToken,
  logout,
  validateRefresh,
  handleValidation,
} from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/refresh', validateRefresh, handleValidation, asyncHandler(refreshAccessToken));
router.post('/logout', validateRefresh, handleValidation, asyncHandler(logout));

export default router;
