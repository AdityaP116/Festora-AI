import type { AIPlanProposal, EventType } from '../types';
import { AIPlanProposalSchema, type ValidatedEventInput } from '../domain/ai-schema';

import { ApiClient } from './api-client';

export interface PlanGenerationResult {
  proposalId: string;
  schemaVersion: 1;
  plan: AIPlanProposal;
  warnings: string[];
}

export const AIService = {
  /**
   * Generates a structured event plan proposal.
   * Calls the live backend function first, falling back to local deterministic generation.
   */
  async generateEventPlan(input: ValidatedEventInput): Promise<PlanGenerationResult> {
    try {
      const liveResult = await ApiClient.generateEventPlan(input);
      if (liveResult && liveResult.plan) {
        return liveResult;
      }
    } catch {
      // Backend unavailable or running in local offline mode
    }

    // Client-side deterministic generation adhering strictly to AIPlanProposalSchema
    await new Promise((resolve) => setTimeout(resolve, 600));

    const totalBudget = input.budgetLimitMinor;
    const currency = input.currency || 'INR';
    const type = input.eventType;
    const guestCount = input.guestCount;
    const startDate = input.startDate;

    // Build tailored proposal according to event type
    const proposal = buildContextualProposal(type, input.title, totalBudget, currency, guestCount, startDate, input.preferences?.theme);

    // Validate the generated structured plan with Zod schema
    const validatedPlan = AIPlanProposalSchema.parse(proposal);

    return {
      proposalId: `prop_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      schemaVersion: 1,
      plan: validatedPlan,
      warnings: [
        'AI cost estimates are non-binding planning figures and do not constitute confirmed vendor quotes.',
        'Please verify local venue availability and seasonal pricing independently.',
      ],
    };
  },

  /**
   * Generates a focused plan revision based on user request (e.g. reduce budget, change theme).
   * Follows AI_SPEC.md Section 7: Revisions preserve user records.
   */
  async proposePlanRevision(
    currentProposal: AIPlanProposal,
    revisionPrompt: string,
    eventId?: string,
    currentPlanVersion?: number
  ): Promise<{ revisedPlan: AIPlanProposal; changeSummary: string }> {
    if (eventId && currentPlanVersion) {
      try {
        const liveResult = await ApiClient.proposePlanRevision(eventId, currentPlanVersion, revisionPrompt);
        if (liveResult && liveResult.revisedPlan) {
          return liveResult;
        }
      } catch {
        // Backend unavailable or offline fallback
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 400));

    const lower = revisionPrompt.toLowerCase();
    const cloned: AIPlanProposal = JSON.parse(JSON.stringify(currentProposal));
    let changeSummary: string;

    if (lower.includes('reduce') || lower.includes('cut') || lower.includes('15%') || lower.includes('save') || lower.includes('budget')) {
      changeSummary = 'Reduced overall estimated category allocations by 15% to create a financial safety buffer.';
      cloned.budget = cloned.budget.map((b) => ({
        ...b,
        estimatedAmountMinor: Math.round(b.estimatedAmountMinor * 0.85),
        rationale: `${b.rationale} (Adjusted down 15% for cost optimization)`,
      }));
      cloned.costSavingIdeas.unshift('Prioritize digital invitations and seasonal locally-sourced florals to maintain quality on a reduced budget.');
    } else if (lower.includes('theme') || lower.includes('modern') || lower.includes('royal') || lower.includes('rustic') || lower.includes('boho')) {
      changeSummary = `Updated theme styling concept to reflect "${revisionPrompt.slice(0, 40)}..."`;
      cloned.theme.name = revisionPrompt.length < 30 ? revisionPrompt : 'Modern Festive Contemporary';
      cloned.theme.description = 'Refreshed aesthetic balancing contemporary elegance with cozy, personalized celebratory accents.';
      cloned.theme.palette = ['#4A2E80', '#D4AF37', '#F5EFEB', '#1A1824', '#8A6BA8'];
    } else if (lower.includes('contingency') || lower.includes('buffer')) {
      changeSummary = 'Added an explicit 10% emergency contingency category into the budget allocation.';
      const contingencyAmount = Math.round(
        cloned.budget.reduce((sum, b) => sum + b.estimatedAmountMinor, 0) * 0.1
      );
      cloned.budget.push({
        categoryKey: 'contingency',
        label: 'Emergency & Contingency Buffer',
        estimatedAmountMinor: contingencyAmount,
        rationale: 'Reserved fund for last-minute supply adjustments or overtime staffing.',
        confidence: 'high',
      });
    } else {
      changeSummary = `Applied refinement: "${revisionPrompt}"`;
      cloned.assumptions.push(`Adjusted planning priorities according to: "${revisionPrompt}"`);
    }

    const validatedPlan = AIPlanProposalSchema.parse(cloned);
    return { revisedPlan: validatedPlan, changeSummary };
  },
};

function buildContextualProposal(
  type: EventType,
  title: string,
  totalBudgetMinor: number,
  currency: string,
  guestCount: number,
  startDateStr: string,
  preferredTheme?: string
): AIPlanProposal {
  // Compute percentage allocations
  const venueShare = 0.35;
  const foodShare = 0.30;
  const decorShare = 0.15;
  const photoShare = 0.10;
  const soundShare = 0.05;

  const vAmount = Math.round(totalBudgetMinor * venueShare);
  const fAmount = Math.round(totalBudgetMinor * foodShare);
  const dAmount = Math.round(totalBudgetMinor * decorShare);
  const pAmount = Math.round(totalBudgetMinor * photoShare);
  const sAmount = Math.round(totalBudgetMinor * soundShare);
  const mAmount = totalBudgetMinor - (vAmount + fAmount + dAmount + pAmount + sAmount);

  // Date offsets
  const start = new Date(startDateStr);
  const fmt = (d: Date) => d.toISOString().split('T')[0];
  const offsetDays = (days: number) => {
    const target = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
    return fmt(target);
  };

  if (type === 'wedding') {
    return {
      schemaVersion: 1,
      summary: `A structured celebration plan for "${title}" hosting ${guestCount} guests, featuring traditional elegance with modern comforts.`,
      theme: {
        name: preferredTheme || 'Royal Botanical Elegance',
        description: 'Deep jewel tones complemented by marigold accents, warm fairy lighting, and fresh fragrant floral installations.',
        palette: ['#6543A5', '#E5A93C', '#2A724E', '#FFFDF9', '#3D255E'],
        ideas: [
          'Personalized welcome lounge with signature mocktail bar',
          'Acoustic traditional instrumentalists during guest arrival',
          'Interactive polaroid guestbook booth',
        ],
      },
      budget: [
        { categoryKey: 'venue', label: 'Venue & Banquet Hall', estimatedAmountMinor: vAmount, rationale: `Capacity for ${guestCount} guests plus dining lawn`, confidence: 'high' },
        { categoryKey: 'catering', label: 'Catering & Beverages', estimatedAmountMinor: fAmount, rationale: `Multi-course feast tailored for ${guestCount} guests`, confidence: 'high' },
        { categoryKey: 'decor', label: 'Decor & Florals', estimatedAmountMinor: dAmount, rationale: 'Entrance arch, stage backdrop, and table centerpieces', confidence: 'medium' },
        { categoryKey: 'photography', label: 'Photography & Cinematography', estimatedAmountMinor: pAmount, rationale: 'Two photographers plus 4K highlight reel coverage', confidence: 'high' },
        { categoryKey: 'entertainment', label: 'Sound, DJ & Lighting', estimatedAmountMinor: sAmount, rationale: 'PA sound system, cordless mics, and ambient dance floor wash', confidence: 'medium' },
        { categoryKey: 'miscellaneous', label: 'Contingency & Gifts', estimatedAmountMinor: mAmount, rationale: 'Guest favors, return gifts, and minor incidental costs', confidence: 'medium' },
      ],
      tasks: [
        { clientKey: 'tk-1', title: 'Confirm & Sign Venue Contract', description: 'Ensure booking includes catering setup timing and sound permissions', categoryKey: 'venue', priority: 'critical', dueDate: offsetDays(-45), isEventDayTask: false },
        { clientKey: 'tk-2', title: 'Finalize Tasting Session with Caterer', description: 'Select welcome appetizers, main course balance, and dessert display', categoryKey: 'catering', priority: 'high', dueDate: offsetDays(-30), isEventDayTask: false },
        { clientKey: 'tk-3', title: 'Review Floral Concept & Moodboard', description: 'Confirm centerpiece heights and stage color palette with decorator', categoryKey: 'decor', priority: 'medium', dueDate: offsetDays(-21), isEventDayTask: false },
        { clientKey: 'tk-4', title: 'Schedule Pre-event Photography Brief', description: 'Provide list of must-have family portraits and candid moments', categoryKey: 'photography', priority: 'medium', dueDate: offsetDays(-14), isEventDayTask: false },
        { clientKey: 'tk-5', title: 'Setup Welcome Table & Guest Sign-in', description: 'Place polaroid station, signage, and guest favors at the main foyer', categoryKey: 'venue', priority: 'high', dueDate: startDateStr, isEventDayTask: true },
        { clientKey: 'tk-6', title: 'Sound & Mic Soundcheck', description: 'Test master mic and ambient background playlist 90 mins prior', categoryKey: 'entertainment', priority: 'critical', dueDate: startDateStr, isEventDayTask: true },
      ],
      milestones: [
        { title: 'Core Venue & Vendors Secured', targetDate: offsetDays(-30), description: 'All top-tier deposits paid and dates locked in.' },
        { title: 'Guest RSVPs Finalized', targetDate: offsetDays(-14), description: 'Final headcounts submitted to catering team.' },
        { title: 'Day-of Logistics Walkthrough', targetDate: offsetDays(-3), description: 'On-site run-through with coordinator and key family members.' },
      ],
      schedule: [
        { startLocalTime: '16:00', endLocalTime: '17:00', title: 'Vendor Setup & Soundcheck', notes: 'Decor finishing touches and sound engineer audio check.' },
        { startLocalTime: '17:30', endLocalTime: '18:30', title: 'Guest Arrival & Welcome Refreshments', notes: 'Acoustic background music and signature welcome drinks.' },
        { startLocalTime: '18:30', endLocalTime: '20:30', title: 'Main Ceremonial Celebration', notes: 'Key moments, family greetings, and speeches.' },
        { startLocalTime: '20:30', endLocalTime: '22:30', title: 'Dinner Banquet & Socializing', notes: 'Dinner buffet opens; open dance floor and candid photos.' },
      ],
      vendorRequirements: [
        { category: 'Catering', whyNeeded: 'Essential for providing premium dining and refreshments for 60+ guests', questionsToAsk: ['Are service staff and cutlery included in the per-plate fee?', 'What is the deposit and cancellation policy?'] },
        { category: 'Photography', whyNeeded: 'Preserve high-resolution memories and video recap of special ceremonies', questionsToAsk: ['How many shooters will attend on the event day?', 'What is the turnaround time for the digital album?'] },
      ],
      assumptions: [
        `Guest count is estimated at approximately ${guestCount}.`,
        'Venue allows external sound equipment and live decorators.',
        `All calculations generated in ${currency}.`,
      ],
      risks: [
        'Late guest RSVP confirmations can impact per-plate catering minimums.',
        'Unpredictable weather if any portion is hosted outdoors; prepare covered contingency.',
      ],
      costSavingIdeas: [
        'Utilize seasonal in-bloom flora rather than imported exotics to lower decor expense by 20%.',
        'Consolidate ceremony and reception in one venue hall to eliminate duplicate transport and setup fees.',
      ],
    };
  }

  // General Celebration / Birthday / College / Community gathering plan
  return {
    schemaVersion: 1,
    summary: `Tailored celebration blueprint for "${title}" designed for ${guestCount} attendees with active entertainment and structured milestones.`,
    theme: {
      name: preferredTheme || 'Vibrant Festive Glow',
      description: 'Energetic and warm celebratory styling featuring ambient lights, clean graphic signage, and inviting social stations.',
      palette: ['#6543A5', '#E5A93C', '#4F46E5', '#FAF8F5', '#1F1B24'],
      ideas: [
        'Custom photo backdrop wall with branded props',
        'Curated celebration playlist featuring crowd favorites',
        'Celebratory toast and dedicated cake or honors ceremony',
      ],
    },
    budget: [
      { categoryKey: 'venue', label: 'Venue Booking & Facilities', estimatedAmountMinor: vAmount, rationale: `Venue rental sized for ${guestCount} guests`, confidence: 'high' },
      { categoryKey: 'catering', label: 'Food, Snacks & Refreshments', estimatedAmountMinor: fAmount, rationale: `Party appetizers and dinner buffet for ${guestCount} people`, confidence: 'high' },
      { categoryKey: 'decor', label: 'Themed Decor & Backdrop', estimatedAmountMinor: dAmount, rationale: 'Welcome arch, photo wall, balloon garland, and lighting', confidence: 'medium' },
      { categoryKey: 'photography', label: 'Photographer / Content Creator', estimatedAmountMinor: pAmount, rationale: 'Coverage of highlights, arrivals, and group photos', confidence: 'medium' },
      { categoryKey: 'entertainment', label: 'Music, Sound & Games', estimatedAmountMinor: sAmount, rationale: 'Speaker system, mic, and event host / emcee', confidence: 'medium' },
      { categoryKey: 'miscellaneous', label: 'Gifts & Minor Supplies', estimatedAmountMinor: mAmount, rationale: 'Favors, custom cake, party favors, and backup items', confidence: 'high' },
    ],
    tasks: [
      { clientKey: 'tkg-1', title: 'Lock In Venue Date & Time', description: 'Confirm hours of access including 1-hour pre-event setup buffer', categoryKey: 'venue', priority: 'critical', dueDate: offsetDays(-21), isEventDayTask: false },
      { clientKey: 'tkg-2', title: 'Confirm Menu & Beverage Package', description: 'Balance vegetarian and non-vegetarian selections with mocktail bar', categoryKey: 'catering', priority: 'high', dueDate: offsetDays(-14), isEventDayTask: false },
      { clientKey: 'tkg-3', title: 'Order Custom Cake / Dessert Table', description: 'Provide theme colors and flavor specifications to bakery', categoryKey: 'miscellaneous', priority: 'medium', dueDate: offsetDays(-10), isEventDayTask: false },
      { clientKey: 'tkg-4', title: 'Send Digital Reminders to Confirmed Guests', description: 'Share venue parking info, dress code, and arrival timing', categoryKey: 'venue', priority: 'medium', dueDate: offsetDays(-5), isEventDayTask: false },
      { clientKey: 'tkg-5', title: 'Stage Setup & Tech Check', description: 'Connect presentation/playlist and test wireless microphones', categoryKey: 'entertainment', priority: 'critical', dueDate: startDateStr, isEventDayTask: true },
      { clientKey: 'tkg-6', title: 'Event Kickoff & Welcome Announcements', description: 'Gather guests and welcome everyone warmly to begin festivities', categoryKey: 'entertainment', priority: 'high', dueDate: startDateStr, isEventDayTask: true },
    ],
    milestones: [
      { title: 'Venue Confirmed & Locked', targetDate: offsetDays(-21), description: 'Deposit submitted and access hours reserved.' },
      { title: 'Guest List & Catering Set', targetDate: offsetDays(-10), description: 'Final food & drink headcount confirmed with vendor.' },
      { title: 'Day-of Event Kickoff', targetDate: startDateStr, description: 'Doors open and guests arrive for celebration.' },
    ],
    schedule: [
      { startLocalTime: '17:00', endLocalTime: '18:00', title: 'Organizer Arrival & Decor Setup', notes: 'Backdrop placement, catering check-in, and cake delivery.' },
      { startLocalTime: '18:00', endLocalTime: '18:45', title: 'Guest Arrival & Welcome Social', notes: 'Background music, welcome snacks, and photo station.' },
      { startLocalTime: '18:45', endLocalTime: '19:45', title: 'Main Program & Celebrations', notes: 'Key ceremony, speeches, cake cutting, or honors.' },
      { startLocalTime: '19:45', endLocalTime: '21:30', title: 'Dinner, Dancing & Social Hour', notes: 'Food served, music tempo lifts, group photos.' },
    ],
    vendorRequirements: [
      { category: 'Venue', whyNeeded: 'Provides comfortable space, lighting, and climate control for guests', questionsToAsk: ['Are tables and chairs included in the package?', 'Is outside catering permitted?'] },
    ],
    assumptions: [
      `Estimated for ${guestCount} guests in ${currency}.`,
      'Event will run for approximately 4 to 5 hours.',
    ],
    risks: [
      'Parking congestion at peak arrival hours.',
      'Audio distortion if non-commercial speakers are used in large hall.',
    ],
    costSavingIdeas: [
      'Self-curate a high-energy Spotify playlist with premium audio equipment instead of booking a full band.',
      'Opt for buffet style instead of plated table service to reduce catering staffing fees.',
    ],
  };
}
