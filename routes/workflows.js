const express = require('express');
const Workflow = require('../models/Workflow');
const ExecutionLog = require('../models/ExecutionLog');
const auth = require('../middleware/auth');

const router = express.Router();

// Create workflow
router.post('/', auth, async (req, res) => {
  const { name, description, triggerType, schedule, steps, isActive } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const workflow = await Workflow.create({
    name,
    description,
    triggerType: triggerType || 'manual',
    schedule,
    steps: (steps || []).map((s, idx) => ({ ...s, order: s.order ?? idx })),
    isActive: !!isActive,
    owner: req.user._id
  });
  res.json(workflow);
});

// List workflows for current user
router.get('/', auth, async (req, res) => {
  const workflows = await Workflow.find({ owner: req.user._id }).sort({ createdAt: -1 });
  res.json(workflows);
});

// Get single workflow
router.get('/:id', auth, async (req, res) => {
  const workflow = await Workflow.findOne({ _id: req.params.id, owner: req.user._id });
  if (!workflow) return res.status(404).json({ error: 'Not found' });
  res.json(workflow);
});

// Update workflow
router.put('/:id', auth, async (req, res) => {
  const { name, description, triggerType, schedule, steps, isActive } = req.body;
  const workflow = await Workflow.findOneAndUpdate(
    { _id: req.params.id, owner: req.user._id },
    {
      name,
      description,
      triggerType,
      schedule,
      steps: (steps || []).map((s, idx) => ({ ...s, order: s.order ?? idx })),
      isActive
    },
    { new: true }
  );
  if (!workflow) return res.status(404).json({ error: 'Not found' });
  res.json(workflow);
});

// Delete workflow
router.delete('/:id', auth, async (req, res) => {
  const workflow = await Workflow.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
  if (!workflow) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

// Execute workflow manually (simulate steps)
router.post('/:id/execute', auth, async (req, res) => {
  const workflow = await Workflow.findOne({ _id: req.params.id, owner: req.user._id });
  if (!workflow) return res.status(404).json({ error: 'Not found' });

  const execution = await ExecutionLog.create({
    workflow: workflow._id,
    triggeredBy: req.user._id,
    triggerType: 'manual',
    status: 'running',
    steps: []
  });

  // simple synchronous simulation of steps
  const stepsResult = [];
  for (const step of workflow.steps.sort((a, b) => a.order - b.order)) {
    if (step.type === 'log') {
      stepsResult.push({
        stepName: step.name,
        type: step.type,
        status: 'success',
        details: { message: step.config?.message || 'Logged from workflow' }
      });
    } else if (step.type === 'delay') {
      stepsResult.push({
        stepName: step.name,
        type: step.type,
        status: 'success',
        details: { delayMs: step.config?.ms || 0 }
      });
    } else if (step.type === 'http') {
      stepsResult.push({
        stepName: step.name,
        type: step.type,
        status: 'success',
        details: { url: step.config?.url, method: step.config?.method || 'GET' }
      });
    } else {
      stepsResult.push({
        stepName: step.name,
        type: step.type,
        status: 'failed',
        details: { error: 'Unsupported step type' }
      });
    }
  }

  execution.steps = stepsResult;
  execution.status = stepsResult.some((s) => s.status === 'failed') ? 'failed' : 'success';
  execution.finishedAt = new Date();
  await execution.save();

  res.json(execution);
});

module.exports = router;
