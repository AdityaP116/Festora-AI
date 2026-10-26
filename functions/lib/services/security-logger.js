"use strict";
/**
 * Festora AI - Security Audit and Suspicious Activity Logger
 * Fulfills Security Principle 9: Monitor suspicious activity and record audit logs.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityLogger = void 0;
class SecurityLoggerService {
    constructor() {
        this.logBuffer = [];
        this.maxBufferSize = 500;
    }
    /**
     * Records a security event with structured metadata.
     */
    log(event) {
        const record = {
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
        }
        else {
            console.warn(logLine);
        }
    }
    /**
     * Retrieves recent recorded security events for inspection / telemetry.
     */
    getRecentEvents(limit = 50) {
        return this.logBuffer.slice(-limit);
    }
    /**
     * Clear buffer (primarily for unit tests).
     */
    clear() {
        this.logBuffer = [];
    }
}
exports.SecurityLogger = new SecurityLoggerService();
//# sourceMappingURL=security-logger.js.map