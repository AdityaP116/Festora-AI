// Festora AI - Schema Validation for Event Inputs and AI Proposals (AI_SPEC.md & API_CONTRACTS.md)
import { z } from 'zod';

export const EventInputSchema = z.object({
  eventType: z.enum(['wedding', 'birthday', 'anniversary', 'college_event', 'community_event', 'other']),
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title cannot exceed 100 characters'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format').optional(),
  timezone: z.string().default('Asia/Kolkata'),
  location: z.object({
    label: z.string().min(1, 'Location label is required'),
    city: z.string().optional(),
    countryCode: z.string().optional(),
  }),
  guestCount: z.number().int().min(1, 'Guest count must be at least 1').max(10000, 'Guest count is too large'),
  currency: z.string().default('INR'),
  budgetLimitMinor: z.number().int().min(100, 'Budget must be greater than zero'),
  preferences: z.object({
    theme: z.string().optional(),
    dietary: z.array(z.string()).optional(),
    priorities: z.array(z.string()).optional(),
    accessibility: z.array(z.string()).optional(),
    notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
  }).optional(),
});

export type ValidatedEventInput = z.infer<typeof EventInputSchema>;
export const ValidatedEventInputSchema = EventInputSchema;

export const AIPlanProposalSchema = z.object({
  schemaVersion: z.literal(1),
  summary: z.string().min(10),
  theme: z.object({
    name: z.string(),
    description: z.string(),
    palette: z.array(z.string()),
    ideas: z.array(z.string()),
  }),
  budget: z.array(z.object({
    categoryKey: z.string(),
    label: z.string(),
    estimatedAmountMinor: z.number().int().nonnegative(),
    rationale: z.string(),
    confidence: z.enum(['low', 'medium', 'high']),
  })),
  tasks: z.array(z.object({
    clientKey: z.string(),
    title: z.string(),
    description: z.string(),
    categoryKey: z.string(),
    priority: z.enum(['low', 'medium', 'high', 'critical']),
    dueDate: z.string(),
    isEventDayTask: z.boolean().default(false),
  })),
  milestones: z.array(z.object({
    title: z.string(),
    targetDate: z.string(),
    description: z.string(),
  })),
  schedule: z.array(z.object({
    startLocalTime: z.string(),
    endLocalTime: z.string(),
    title: z.string(),
    notes: z.string(),
  })),
  vendorRequirements: z.array(z.object({
    category: z.string(),
    whyNeeded: z.string(),
    questionsToAsk: z.array(z.string()),
  })),
  assumptions: z.array(z.string()),
  risks: z.array(z.string()),
  costSavingIdeas: z.array(z.string()),
});
