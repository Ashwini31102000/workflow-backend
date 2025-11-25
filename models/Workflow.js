const mongoose = require('mongoose');

const stepSchema = new mongoose.Schema({
  type: { type: String, enum: ['http', 'delay', 'log'], required: true },
  name: { type: String, required: true },
  config: { type: Object, default: {} },
  order: { type: Number, required: true }
}, { _id: false });

const workflowSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: false },
  triggerType: { type: String, enum: ['manual', 'schedule', 'webhook'], default: 'manual' },
  schedule: { type: String }, // cron expression (optional, display only in this version)
  steps: [stepSchema]
}, { timestamps: true });

module.exports = mongoose.model('Workflow', workflowSchema);
