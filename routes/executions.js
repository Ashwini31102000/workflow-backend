const express = require('express');
const ExecutionLog = require('../models/ExecutionLog');
const Workflow = require('../models/Workflow');
const auth = require('../middleware/auth');

const router = express.Router();

// List executions for current user's workflows
router.get('/', auth, async (req, res) => {
  const executions = await ExecutionLog.find()
    .populate('workflow', 'name owner')
    .populate('triggeredBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const filtered = executions.filter((e) => e.workflow && String(e.workflow.owner) === String(req.user._id));
  res.json(filtered);
});

module.exports = router;
