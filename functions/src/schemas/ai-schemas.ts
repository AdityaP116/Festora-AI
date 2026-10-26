import { z } from 'zod';

export const EventTypeEnum = z.enum([
  'wedding',
  'birthday',
  'anniversary',
  'college_event',
  'community_event',
  'other',
]);

export const TaskPriorityEnum = z.enum(['low', 'medium', 'high', 'critical']);
export const TaskStatusEnum = z.enum(['pending', 'in_progress', 'completed', 'cancelled']);

export const ValidatedEventInputSchema = z.object({
  title: z.string().min(3).max(120),
  eventType: EventTypeEnum,
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format must be YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format must be YYYY-MM-DD').optional(),
  timezone: z.string().default('Asia/Kolkata'),
  location: z.object({
    label: z.string().min(2).max(150),
    city: z.string().max(80).optional(),
    countryCode: z.string().max(10).optional(),
  }),
  currency: z.string().length(3).default('INR'),
  guestCount: z.number().int().min(1).max(50000),
  budgetLimitMinor: z.number().int().min(0).max(100000000000),
  preferences: z.object({
    theme: z.string().max(100).optional(),
    dietary: z.array(z.string().max(50)).max(20).optional(),
    priorities: z.array(z.string().max(50)).max(10).optional(),
    accessibility: z.array(z.string().max(100)).max(10).optional(),
    notes: z.string().max(1000).optional(),
  }).optional(),
});

export type ValidatedEventInput = z.infer<typeof ValidatedEventInputSchema>;

export const BudgetCategoryProposalSchema = z.object({
  categoryKey: z.string().min(1).max(50),
  label: z.string().min(1).max(100),
  estimatedAmountMinor: z.number().int().nonnegative(),
  rationale: z.string().max(500),
  confidence: z.enum(['low', 'medium', 'high']),
});

export const TaskProposalSchema = z.object({
  clientKey: z.string().min(1).max(80),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  categoryKey: z.string().min(1).max(50),
  priority: TaskPriorityEnum,
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  isEventDayTask: z.boolean(),
});

export const MilestoneProposalSchema = z.object({
  title: z.string().min(1).max(150),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  description: z.string().max(500),
});

export const ScheduleItemProposalSchema = z.object({
  startLocalTime: z.string().regex(/^\d{2}:\d{2}$/),
  endLocalTime: z.string().regex(/^\d{2}:\d{2}$/),
  title: z.string().min(1).max(150),
  notes: z.string().max(500).optional(),
});

export const VendorRequirementSchema = z.object({
  category: z.string().min(1).max(80),
  whyNeeded: z.string().max(500),
  questionsToAsk: z.array(z.string().max(300)).max(10),
});

export const AIPlanProposalSchema = z.object({
  schemaVersion: z.literal(1),
  summary: z.string().min(10).max(2000),
  theme: z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(1000),
    palette: z.array(z.string().regex(/^#[0-9A-Fa-f]{6}$/)).min(2).max(8),
    ideas: z.array(z.string().max(300)).max(15),
  }),
  budget: z.array(BudgetCategoryProposalSchema).min(1).max(30),
  tasks: z.array(TaskProposalSchema).min(1).max(100),
  milestones: z.array(MilestoneProposalSchema).min(1).max(30),
  schedule: z.array(ScheduleItemProposalSchema).min(1).max(40),
  vendorRequirements: z.array(VendorRequirementSchema).max(20),
  assumptions: z.array(z.string().max(400)).max(25),
  risks: z.array(z.string().max(400)).max(25),
  costSavingIdeas: z.array(z.string().max(400)).max(20),
});

export type AIPlanProposal = z.infer<typeof AIPlanProposalSchema>;

export const ProposePlanRevisionRequestSchema = z.object({
  eventId: z.string().min(1),
  currentPlanVersion: z.number().int().min(1),
  request: z.string().min(3).max(800),
  sections: z.array(z.string()).max(10).optional(),
});

export const ApplyEventPlanRequestSchema = z.object({
  eventId: z.string().min(1),
  proposalId: z.string().min(1),
  plan: AIPlanProposalSchema,
  changeSummary: z.string().max(500).optional(),
});
