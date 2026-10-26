import { describe, it, expect } from 'vitest';
import { StorageService } from '../src/services/storage';
import { AIService } from '../src/services/ai-service';

describe('Plan Revision Safety & User Record Protection (TEST_PLAN.md E2E-05)', () => {
  const testOwner = 'test_usr_revision_safety';

  it('preserves completed tasks, user-created tasks, and actual expenses across plan revisions', async () => {
    // 1. Create a test event
    const event = await StorageService.createEvent({
      ownerUid: testOwner,
      title: 'Safety Test Event',
      eventType: 'wedding',
      startDate: '2027-05-20',
      timezone: 'Asia/Kolkata',
      location: { label: 'Goa Beach Resort' },
      currency: 'INR',
      guestCount: 100,
      budgetLimitMinor: 100000000,
      status: 'planning',
    });

    // 2. Generate initial AI plan and apply it
    const planResult = await AIService.generateEventPlan({
      title: event.title,
      eventType: event.eventType,
      startDate: event.startDate,
      timezone: event.timezone,
      location: event.location,
      currency: event.currency,
      guestCount: event.guestCount,
      budgetLimitMinor: event.budgetLimitMinor,
    });

    await StorageService.applyPlanProposal(event.id, testOwner, planResult.plan);

    // 3. Mark one task as completed
    const tasks = await StorageService.getTasks(testOwner, event.id);
    expect(tasks.length).toBeGreaterThan(0);
    const completedTaskId = tasks[0].id;
    await StorageService.updateTask(testOwner, event.id, completedTaskId, {
      status: 'completed',
    });

    // 4. Add a custom user-created task
    const userTask = await StorageService.createTask(testOwner, event.id, {
      title: 'Custom Family Gift Preparation',
      description: 'Handmade souvenirs for bridal party',
      category: 'personal',
      priority: 'high',
      status: 'pending',
      dueAt: '2027-05-18',
      isEventDayTask: false,
      source: 'user', // Source is user
    });

    // 5. Add an actual recorded expense
    const expense = await StorageService.createExpense(testOwner, event.id, {
      description: 'Actual Deposit Paid to Resort',
      categoryKey: 'venue',
      actualAmountMinor: 30000000,
      currency: 'INR',
      expenseStatus: 'incurred',
      paymentStatus: 'paid',
      source: 'user',
    });

    // 6. Now generate a broad revision (e.g. cut budget 15%)
    const revision = await AIService.proposePlanRevision(
      planResult.plan,
      'Reduce budget by 15% to create savings'
    );

    // 7. Apply the revision
    await StorageService.applyPlanProposal(
      event.id,
      testOwner,
      revision.revisedPlan,
      revision.changeSummary
    );

    // 8. VERIFY:
    // a. The completed task must STILL be marked as completed!
    const postRevisionTasks = await StorageService.getTasks(testOwner, event.id);
    const completedTaskAfter = postRevisionTasks.find((t) => t.id === completedTaskId);
    expect(completedTaskAfter).toBeDefined();
    expect(completedTaskAfter?.status).toBe('completed');

    // b. The custom user task must STILL be present!
    const userTaskAfter = postRevisionTasks.find((t) => t.id === userTask.id);
    expect(userTaskAfter).toBeDefined();
    expect(userTaskAfter?.title).toBe('Custom Family Gift Preparation');

    // c. The recorded expense must STILL be present and untouched!
    const expensesAfter = await StorageService.getExpenses(testOwner, event.id);
    const expenseAfter = expensesAfter.find((e) => e.id === expense.id);
    expect(expenseAfter).toBeDefined();
    expect(expenseAfter?.actualAmountMinor).toBe(30000000);
    expect(expenseAfter?.paymentStatus).toBe('paid');

    // d. Plan versions log recorded a new version
    const versions = await StorageService.getPlanVersions(event.id);
    expect(versions.length).toBeGreaterThanOrEqual(2);
  });
});
