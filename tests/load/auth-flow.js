/**
 * Festora AI - k6 Auth Flow Helper
 * Generates isolated virtual user credentials and auth tokens without hardcoding secrets.
 */

export function getAuthHeaders(vuId) {
  // Use isolated test tokens in emulator/test environment
  const testUid = `loadtest_user_${vuId || 'anon'}`;
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer test_token_${testUid}`,
    'x-request-id': `load_${Date.now()}_vu_${vuId}`,
  };
}
