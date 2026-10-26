"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplyEventPlanRequestSchema = exports.ProposePlanRevisionRequestSchema = exports.AIPlanProposalSchema = exports.VendorRequirementSchema = exports.ScheduleItemProposalSchema = exports.MilestoneProposalSchema = exports.TaskProposalSchema = exports.BudgetCategoryProposalSchema = exports.ValidatedEventInputSchema = exports.TaskStatusEnum = exports.TaskPriorityEnum = exports.EventTypeEnum = void 0;
const zod_1 = require("zod");
exports.EventTypeEnum = zod_1.z.enum([
    'wedding',
    'birthday',
    'anniversary',
    'college_event',
    'community_event',
    'other',
]);
exports.TaskPriorityEnum = zod_1.z.enum(['low', 'medium', 'high', 'critical']);
exports.TaskStatusEnum = zod_1.z.enum(['pending', 'in_progress', 'completed', 'cancelled']);
exports.ValidatedEventInputSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).max(120),
    eventType: exports.EventTypeEnum,
    startDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format must be YYYY-MM-DD'),
    endDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format must be YYYY-MM-DD').optional(),
    timezone: zod_1.z.string().default('Asia/Kolkata'),
    location: zod_1.z.object({
        label: zod_1.z.string().min(2).max(150),
        city: zod_1.z.string().max(80).optional(),
        countryCode: zod_1.z.string().max(10).optional(),
    }),
    currency: zod_1.z.string().length(3).default('INR'),
    guestCount: zod_1.z.number().int().min(1).max(50000),
    budgetLimitMinor: zod_1.z.number().int().min(0).max(100000000000),
    preferences: zod_1.z.object({
        theme: zod_1.z.string().max(100).optional(),
        dietary: zod_1.z.array(zod_1.z.string().max(50)).max(20).optional(),
        priorities: zod_1.z.array(zod_1.z.string().max(50)).max(10).optional(),
        accessibility: zod_1.z.array(zod_1.z.string().max(100)).max(10).optional(),
        notes: zod_1.z.string().max(1000).optional(),
    }).optional(),
});
exports.BudgetCategoryProposalSchema = zod_1.z.object({
    categoryKey: zod_1.z.string().min(1).max(50),
    label: zod_1.z.string().min(1).max(100),
    estimatedAmountMinor: zod_1.z.number().int().nonnegative(),
    rationale: zod_1.z.string().max(500),
    confidence: zod_1.z.enum(['low', 'medium', 'high']),
});
exports.TaskProposalSchema = zod_1.z.object({
    clientKey: zod_1.z.string().min(1).max(80),
    title: zod_1.z.string().min(1).max(200),
    description: zod_1.z.string().max(1000).optional(),
    categoryKey: zod_1.z.string().min(1).max(50),
    priority: exports.TaskPriorityEnum,
    dueDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    isEventDayTask: zod_1.z.boolean(),
});
exports.MilestoneProposalSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(150),
    targetDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    description: zod_1.z.string().max(500),
});
exports.ScheduleItemProposalSchema = zod_1.z.object({
    startLocalTime: zod_1.z.string().regex(/^\d{2}:\d{2}$/),
    endLocalTime: zod_1.z.string().regex(/^\d{2}:\d{2}$/),
    title: zod_1.z.string().min(1).max(150),
    notes: zod_1.z.string().max(500).optional(),
});
exports.VendorRequirementSchema = zod_1.z.object({
    category: zod_1.z.string().min(1).max(80),
    whyNeeded: zod_1.z.string().max(500),
    questionsToAsk: zod_1.z.array(zod_1.z.string().max(300)).max(10),
});
exports.AIPlanProposalSchema = zod_1.z.object({
    schemaVersion: zod_1.z.literal(1),
    summary: zod_1.z.string().min(10).max(2000),
    theme: zod_1.z.object({
        name: zod_1.z.string().min(1).max(100),
        description: zod_1.z.string().max(1000),
        palette: zod_1.z.array(zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/)).min(2).max(8),
        ideas: zod_1.z.array(zod_1.z.string().max(300)).max(15),
    }),
    budget: zod_1.z.array(exports.BudgetCategoryProposalSchema).min(1).max(30),
    tasks: zod_1.z.array(exports.TaskProposalSchema).min(1).max(100),
    milestones: zod_1.z.array(exports.MilestoneProposalSchema).min(1).max(30),
    schedule: zod_1.z.array(exports.ScheduleItemProposalSchema).min(1).max(40),
    vendorRequirements: zod_1.z.array(exports.VendorRequirementSchema).max(20),
    assumptions: zod_1.z.array(zod_1.z.string().max(400)).max(25),
    risks: zod_1.z.array(zod_1.z.string().max(400)).max(25),
    costSavingIdeas: zod_1.z.array(zod_1.z.string().max(400)).max(20),
});
exports.ProposePlanRevisionRequestSchema = zod_1.z.object({
    eventId: zod_1.z.string().min(1),
    currentPlanVersion: zod_1.z.number().int().min(1),
    request: zod_1.z.string().min(3).max(800),
    sections: zod_1.z.array(zod_1.z.string()).max(10).optional(),
});
exports.ApplyEventPlanRequestSchema = zod_1.z.object({
    eventId: zod_1.z.string().min(1),
    proposalId: zod_1.z.string().min(1),
    plan: exports.AIPlanProposalSchema,
    changeSummary: zod_1.z.string().max(500).optional(),
});
//# sourceMappingURL=ai-schemas.js.map