const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');

router.get('/health', async (req, res) => {
  const aiHealth = await aiService.checkAIHealth();
  res.json({
    status: 'ok',
    service: 'AI Resume Screening Backend',
    aiService: aiHealth
  });
});

module.exports = router;
