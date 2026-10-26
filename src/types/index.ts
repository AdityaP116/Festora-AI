// Festora AI - Core Type Definitions (DATA_MODEL.md & AI_SPEC.md)

export type EventType = 
  | 'wedding' 
  | 'birthday' 
  | 'anniversary' 
  | 'college_event' 
  | 'community_event' 
  | 'other';

export type EventStatus = 'planning' | 'in_progress' | 'completed' | 'archived';

export interface LocationInfo {
  label: string;
  city?: string;
  countryCode?: string;
}

export interface EventPreferences {
  theme?: string;
  dietary?: string[];
  priorities?: string[];
  accessibility?: string[];
  notes?: string;
}

export interface EventDocument {
  id: string;
  ownerUid: string;
  title: string;
  eventType: EventType;
  startAt: string; // ISO date string
  endAt?: string;
  timezone: string; // IANA identifier e.g. "Asia/Kolkata"
  location: LocationInfo;
  currency: string; // ISO 4217, default 'INR'
  guestCount: number;
  budgetLimitMinor: number; // In smallest currency unit (e.g. paise / cents)
  preferences: EventPreferences;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
  schemaVersion: number;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface TaskDocument {
  id: string;
  eventId: string;
  title: string;
  description?: string;
  category: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueAt?: string;
  isEventDayTask: boolean;
  assignedToUid?: string;
  source: 'user' | 'ai';
  planVersionId?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  revision: number;
}

export type BudgetSource = 'ai_estimate' | 'user_estimate' | 'vendor_quote';

export interface BudgetCategoryDocument {
  id: string;
  eventId: string;
  name: string;
  categoryKey: string;
  estimatedAmountMinor: number;
  source: BudgetSource;
  notes?: string;
  updatedAt: string;
  planVersionId?: string;
}

export type ExpenseStatus = 'planned' | 'incurred' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'partially_paid' | 'paid' | 'refunded' | 'not_applicable';

export interface ExpenseDocument {
  id: string;
  eventId: string;
  description: string;
  categoryKey: string;
  estimatedAmountMinor?: number;
  actualAmountMinor?: number;
  currency: string;
  expenseStatus: ExpenseStatus;
  paymentStatus: PaymentStatus;
  vendorId?: string;
  incurredAt?: string;
  createdAt: string;
  updatedAt: string;
  source: 'user' | 'vendor_quote' | 'imported';
}

export type BookingStatus = 
  | 'researching' 
  | 'contacted' 
  | 'quoted' 
  | 'shortlisted' 
  | 'booked' 
  | 'rejected' 
  | 'cancelled';

export interface VendorDocument {
  id: string;
  eventId: string;
  name: string;
  category: string;
  contactName?: string;
  phone?: string;
  email?: string;
  website?: string;
  quotedAmountMinor?: number;
  currency?: string;
  quoteReceivedAt?: string;
  quoteValidUntil?: string;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  notes?: string;
  source: 'user_entered' | 'verified_integration';
  createdAt: string;
  updatedAt: string;
}

export type RSVPStatus = 'not_invited' | 'invited' | 'confirmed' | 'declined' | 'maybe';

export interface GuestDocument {
  id: string;
  eventId: string;
  displayName: string;
  group?: string; // Family, Friends, Colleagues, VIP
  rsvpStatus: RSVPStatus;
  dietaryPreferences?: string[];
  accessibilityNotes?: string;
  plusOneCount?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// AI Spec Structured Output
export interface AITheme {
  name: string;
  description: string;
  palette: string[];
  ideas: string[];
}

export interface AIBudgetItem {
  categoryKey: string;
  label: string;
  estimatedAmountMinor: number;
  rationale: string;
  confidence: 'low' | 'medium' | 'high';
}

export interface AITaskItem {
  clientKey: string;
  title: string;
  description: string;
  categoryKey: string;
  priority: TaskPriority;
  dueDate: string; // YYYY-MM-DD
  isEventDayTask: boolean;
}

export interface AIMilestoneItem {
  title: string;
  targetDate: string; // YYYY-MM-DD
  description: string;
}

export interface AIScheduleItem {
  startLocalTime: string; // HH:mm
  endLocalTime: string; // HH:mm
  title: string;
  notes: string;
}

export interface AIVendorRequirement {
  category: string;
  whyNeeded: string;
  questionsToAsk: string[];
}

export interface AIPlanProposal {
  schemaVersion: 1;
  summary: string;
  theme: AITheme;
  budget: AIBudgetItem[];
  tasks: AITaskItem[];
  milestones: AIMilestoneItem[];
  schedule: AIScheduleItem[];
  vendorRequirements: AIVendorRequirement[];
  assumptions: string[];
  risks: string[];
  costSavingIdeas: string[];
}

export interface PlanVersionDocument {
  id: string;
  eventId: string;
  version: number;
  schemaVersion: number;
  generatedAt: string;
  modelId: string;
  inputsSnapshot: Record<string, unknown>;
  plan: AIPlanProposal;
  changeSummary?: string;
  createdByUid: string;
  status: 'proposed' | 'applied' | 'superseded' | 'rejected';
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  defaultCurrency: string;
  createdAt: string;
}
