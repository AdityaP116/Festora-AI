/**
 * Festora AI - Security Audit and Suspicious Activity Logger
 * Fulfills Security Principle 9: Monitor suspicious activity and record audit logs.
 */

export interface SecurityEvent {
  timestamp: string;
  eventType:
    | 'AUTH_FAILURE'
    | 'PERMISSION_DENIED'
    | 'RATE_LIMIT_EXCEEDED'
    | 'PAYLOAD_MALFORMED'
    | 'UNTRUSTED_INPUT_DETECTED'
    | 'SENSITIVE_DATA_BLOCKED'
    | 'SUSPICIOUS_HIGH_VOLUME';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  ip?: string;
  uid?: string;
  endpoint?: string;
  method?: string;
  requestId?: string;
  details: Record<string, unknown>;
}

class SecurityLoggerService {
  private logBuffer: SecurityEvent[] = [];
  private maxBufferSize = 500;

  /**
   * Records a security event with structured metadata.
   */
  log(event: Omit<SecurityEvent, 'timestamp'>): void {
    const record: SecurityEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };

    this.logBuffer.push(record);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }

    const logLine = `[SECURITY_AUDIT] [${record.severity}] [${record.eventType}] uid=${record.uid || 'anon'} ip=${record.ip || 'unknown'} req=${record.requestId || 'none'} details=${JSON.stringify(record.details)}`;

    if (record.severity === 'CRITICAL' || record.severity === 'HIGH') {
      console.error(logLine);
    } else {
      console.warn(logLine);
    }
  }

  /**
   * Retrieves recent recorded security events for inspection / telemetry.
   */
  getRecentEvents(limit = 50): SecurityEvent[] {
    return this.logBuffer.slice(-limit);
  }

  /**
   * Clear buffer (primarily for unit tests).
   */
  clear(): void {
    this.logBuffer = [];
  }
}

export const SecurityLogger = new SecurityLoggerService();
