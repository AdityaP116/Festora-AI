/**
 * Festora AI - Privacy-Preserving Conversion & Analytics Tracker
 * Fulfills item 7: Add conversion event tracking without third-party invasive cookies.
 */

export type ConversionEventName =
  | 'view_landing'
  | 'click_start_plan'
  | 'complete_event_wizard'
  | 'generate_ai_plan'
  | 'apply_plan_proposal'
  | 'propose_plan_revision'
  | 'submit_contact_form'
  | 'sign_up'
  | 'sign_in';

export interface AnalyticsEvent {
  eventName: ConversionEventName;
  properties?: Record<string, unknown>;
  timestamp: string;
}

class AnalyticsService {
  private eventLog: AnalyticsEvent[] = [];

  /**
   * Tracks a high-level user conversion event.
   */
  track(eventName: ConversionEventName, properties?: Record<string, unknown>): void {
    // Check consent preference
    const consent = localStorage.getItem('festora_cookie_consent');
    if (consent === 'rejected') {
      return; // Respect user rejection of analytics
    }

    const payload: AnalyticsEvent = {
      eventName,
      properties,
      timestamp: new Date().toISOString(),
    };

    this.eventLog.push(payload);
    if (this.eventLog.length > 200) {
      this.eventLog.shift();
    }

    // Emit event for custom listeners / telemetry
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('festora:analytics', { detail: payload }));
      // Forward to window.dataLayer if GTM / GA4 exists
      if (Array.isArray((window as any).dataLayer)) {
        (window as any).dataLayer.push({ event: eventName, ...properties });
      }
    }

    if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
      console.log(`[CONVERSION_TRACKING] ${eventName}:`, properties || {});
    }
  }

  getRecentEvents(): AnalyticsEvent[] {
    return this.eventLog;
  }
}

export const Analytics = new AnalyticsService();
