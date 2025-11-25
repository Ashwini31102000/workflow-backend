const mongoose = require('mongoose');

const stepResultSchema = new mongoose.Schema({
  stepName: String,
  type: String,
  status: { type: String, enum: ['success', 'failed'], default: 'success' },
  details: { type: Object, default: {} }
}, { _id: false });

const executionLogSchema = new mongoose.Schema({
  workflow: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow', required: true },
  triggeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  triggerType: { type: String, enum: ['manual', 'schedule', 'webhook'], default: 'manual' },
  status: { type: String, enum: ['running', 'success', 'failed'], default: 'running' },
  steps: [stepResultSchema],
  startedAt: { type: Date, default: Date.now },
  finishedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('ExecutionLog', executionLogSchema);
