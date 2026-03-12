const express    = require('express');
const { markComplete, getMyCompletions, getClassStats } = require('../controllers/completionController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();
router.use(requireAuth);

// POST   /api/completions              — student verifies parent code & marks event done
router.post('/',                      markComplete);

// GET    /api/completions/my-events    — student fetches their own completed event IDs
router.get('/my-events',              getMyCompletions);

// GET    /api/completions/class-stats/:classCode  — teacher fetches full stats for a class
router.get('/class-stats/:classCode', getClassStats);

module.exports = router;