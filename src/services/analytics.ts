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
    // Check consent preference: require explicit positive consent ('accepted' or custom prefs with analytics === true)
    if (typeof localStorage !== 'undefined') {
      const consent = localStorage.getItem('festora_cookie_consent');
      if (!consent || consent === 'rejected') {
        return; // Do not track if not consented or explicitly rejected (GDPR / ePrivacy compliant)
      }
      if (consent === 'custom') {
        try {
          const rawPrefs = localStorage.getItem('festora_cookie_preferences');
          const prefs = rawPrefs ? JSON.parse(rawPrefs) : null;
          if (!prefs || !prefs.analytics) {
            return;
          }
        } catch {
          return;
        }
      }
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
      const win = window as unknown as { dataLayer?: unknown[] };
      if (Array.isArray(win.dataLayer)) {
        win.dataLayer.push({ event: eventName, ...properties });
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
