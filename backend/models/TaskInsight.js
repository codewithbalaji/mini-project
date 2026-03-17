import mongoose from 'mongoose';

const recommendationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['status', 'priority', 'time', 'action'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['info', 'warning', 'critical'],
    required: true
  }
});

const taskInsightSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  recommendations: [recommendationSchema],
  taskSnapshot: {
    status: String,
    priority: String,
    loggedHours: Number,
    estimatedHours: Number,
    dueDate: Date,
    updatesCount: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
taskInsightSchema.index({ taskId: 1, organizationId: 1 });
taskInsightSchema.index({ createdAt: -1 });

// Update the updatedAt field on save
taskInsightSchema.pre('save', function() {
  this.updatedAt = new Date();
});

const TaskInsight = mongoose.model('TaskInsight', taskInsightSchema);

export default TaskInsight;