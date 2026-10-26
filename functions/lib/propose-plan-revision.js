"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleProposePlanRevision = handleProposePlanRevision;
const ai_schemas_1 = require("./schemas/ai-schemas");
const authorization_1 = require("./services/authorization");
async function handleProposePlanRevision(authHeader, body, firestore) {
    // 1. Authenticate caller
    const auth = await (0, authorization_1.verifyAuthHeader)(authHeader);
    // 2. Validate input schema
    const parsed = ai_schemas_1.ProposePlanRevisionRequestSchema.safeParse(body);
    if (!parsed.success) {
        const msg = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
        throw new authorization_1.AuthorizationError(`Invalid plan revision request: ${msg}`, 'INVALID_ARGUMENT');
    }
    const { eventId, currentPlanVersion, request } = parsed.data;
    // 3. Verify event ownership
    await (0, authorization_1.verifyEventOwnership)(firestore, auth.uid, eventId);
    // 4. Retrieve current plan version document
    const eventRef = firestore.collection('users').doc(auth.uid).collection('events').doc(eventId);
    const versionsSnap = await eventRef
        .collection('planVersions')
        .where('version', '==', currentPlanVersion)
        .limit(1)
        .get();
    let basePlan;
    if (!versionsSnap.empty) {
        basePlan = versionsSnap.docs[0].data().plan;
    }
    else {
        // If no explicit version document exists, load the latest available
        const latestSnap = await eventRef.collection('planVersions').orderBy('version', 'desc').limit(1).get();
        if (latestSnap.empty) {
            throw new authorization_1.AuthorizationError('No baseline plan version found to revise.', 'NOT_FOUND');
        }
        basePlan = latestSnap.docs[0].data().plan;
    }
    // 5. Apply revision rules (AI_SPEC.md Section 7)
    const lower = request.toLowerCase();
    const cloned = JSON.parse(JSON.stringify(basePlan));
    let changeSummary;
    if (lower.includes('reduce') || lower.includes('cut') || lower.includes('save') || lower.includes('budget') || lower.includes('15%')) {
        changeSummary = 'Reduced overall estimated category allocations by 15% to create a financial safety buffer.';
        cloned.budget = cloned.budget.map((b) => ({
            ...b,
            estimatedAmountMinor: Math.round(b.estimatedAmountMinor * 0.85),
            rationale: `${b.rationale} (Adjusted down 15% for cost optimization)`,
        }));
        cloned.costSavingIdeas.unshift('Prioritize seasonal florals and digital invitations to maintain elegance on a reduced budget.');
    }
    else if (lower.includes('theme') || lower.includes('royal') || lower.includes('modern') || lower.includes('boho') || lower.includes('rustic')) {
        changeSummary = `Updated aesthetic concept to reflect: "${request.slice(0, 50)}"`;
        cloned.theme.name = request.length < 35 ? request : 'Modern Refined Celebration';
        cloned.theme.description = 'Atmospheric styling balancing contemporary luxury with personal celebratory accents.';
        cloned.theme.palette = ['#4A2E80', '#D4AF37', '#FAF8FC', '#1A1824', '#8A6BA8'];
    }
    else if (lower.includes('contingency') || lower.includes('buffer')) {
        changeSummary = 'Added an explicit 10% emergency contingency category into the budget allocation.';
        const totalAlloc = cloned.budget.reduce((sum, b) => sum + b.estimatedAmountMinor, 0);
        const contingencyAmount = Math.round(totalAlloc * 0.1);
        cloned.budget.push({
            categoryKey: 'contingency',
            label: 'Emergency & Contingency Buffer',
            estimatedAmountMinor: contingencyAmount,
            rationale: 'Reserved fund for unforeseen logistical changes or vendor overtime.',
            confidence: 'high',
        });
    }
    else {
        changeSummary = `Applied refinement: "${request}"`;
        cloned.assumptions.push(`Adjusted planning priorities according to: "${request}"`);
    }
    // Validate the revised plan against the schema
    const validatedPlan = ai_schemas_1.AIPlanProposalSchema.parse(cloned);
    return { revisedPlan: validatedPlan, changeSummary };
}
//# sourceMappingURL=propose-plan-revision.js.map