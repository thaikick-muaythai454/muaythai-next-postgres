import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';

// Mock window object
const mockGtag = jest.fn();
const originalWindow = global.window;

beforeEach(() => {
  jest.resetModules();
  // Reset window mock
  if (typeof global.window !== 'undefined') {
    (global.window as unknown as { gtag?: typeof mockGtag }).gtag = mockGtag;
  } else {
    // Create window object if it doesn't exist (for SSR scenarios)
    global.window = {
      gtag: mockGtag,
    } as unknown as Window & typeof globalThis;
  }
  mockGtag.mockClear();
});

afterEach(() => {
  jest.restoreAllMocks();
  // Restore original window
  if (originalWindow) {
    global.window = originalWindow;
  } else {
    delete (global as { window?: unknown }).window;
  }
});

describe('TC-9.1: User Signup Event Tracking', () => {
  describe('trackUserSignup function', () => {
    test('should call trackEvent with correct parameters for email signup', async () => {
      const { trackUserSignup } = await import('../../../src/lib/utils/analytics');
      const userId = 'test-user-123';
      const method = 'email';

      trackUserSignup(userId, method);

      // Verify gtag was called with correct event name and parameters
      expect(mockGtag).toHaveBeenCalledTimes(1);
      expect(mockGtag).toHaveBeenCalledWith('event', 'sign_up', {
        user_id: userId,
        method: method,
      });
    });

    test('should call trackEvent with correct parameters for google signup', async () => {
      const { trackUserSignup } = await import('../../../src/lib/utils/analytics');
      const userId = 'test-user-456';
      const method = 'google';

      trackUserSignup(userId, method);

      // Verify gtag was called with correct event name and parameters
      expect(mockGtag).toHaveBeenCalledTimes(1);
      expect(mockGtag).toHaveBeenCalledWith('event', 'sign_up', {
        user_id: userId,
        method: method,
      });
    });

    test('should use default email method when method not provided', async () => {
      const { trackUserSignup } = await import('../../../src/lib/utils/analytics');
      const userId = 'test-user-789';

      trackUserSignup(userId);

      // Verify gtag was called with default email method
      expect(mockGtag).toHaveBeenCalledTimes(1);
      expect(mockGtag).toHaveBeenCalledWith('event', 'sign_up', {
        user_id: userId,
        method: 'email',
      });
    });

    test('should not throw error when gtag is not available (SSR safety)', async () => {
      // Remove gtag from window
      delete (global.window as unknown as { gtag?: unknown }).gtag;

      const { trackUserSignup } = await import('../../../src/lib/utils/analytics');
      const userId = 'test-user-ssr';
      const method = 'email';

      // Should not throw error
      expect(() => {
        trackUserSignup(userId, method);
      }).not.toThrow();

      // gtag should not be called
      expect(mockGtag).not.toHaveBeenCalled();
    });

    test('should not throw error when window is undefined (SSR safety)', async () => {
      // Remove window object completely
      const originalWindowRef = global.window;
      delete (global as { window?: unknown }).window;

      const { trackUserSignup } = await import('../../../src/lib/utils/analytics');
      const userId = 'test-user-ssr-2';
      const method = 'email';

      // Should not throw error
      expect(() => {
        trackUserSignup(userId, method);
      }).not.toThrow();

      // Restore window
      global.window = originalWindowRef;
    });

    test('should send event with correct event_name: sign_up', async () => {
      const { trackUserSignup } = await import('../../../src/lib/utils/analytics');
      const userId = 'test-user-event-name';
      const method = 'email';

      trackUserSignup(userId, method);

      // Verify event name is 'sign_up' (standard GA4 event)
      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'sign_up', // Standard GA4 event name
        expect.objectContaining({
          user_id: userId,
          method: method,
        })
      );
    });

    test('should include user_id parameter correctly', async () => {
      const { trackUserSignup } = await import('../../../src/lib/utils/analytics');
      const userId = 'specific-user-id-12345';
      const method = 'google';

      trackUserSignup(userId, method);

      expect(mockGtag).toHaveBeenCalledWith('event', 'sign_up', {
        user_id: userId,
        method: method,
      });
    });

    test('should include method parameter correctly', async () => {
      const { trackUserSignup } = await import('../../../src/lib/utils/analytics');
      const userId = 'test-user-method';
      const methods = ['email', 'google', 'facebook', 'apple'];

      methods.forEach((method) => {
        mockGtag.mockClear();
        trackUserSignup(userId, method);

        expect(mockGtag).toHaveBeenCalledWith('event', 'sign_up', {
          user_id: userId,
          method: method,
        });
      });
    });
  });

  describe('window.trackUserSignup availability', () => {
    test('should expose trackUserSignup on window object', async () => {
      // Reset modules to trigger the window assignment
      jest.resetModules();
      (global.window as unknown as { gtag?: typeof mockGtag }).gtag = mockGtag;

      await import('../../../src/lib/utils/analytics');

      // Check if trackUserSignup is available on window
      expect(typeof (global.window as unknown as { trackUserSignup?: unknown }).trackUserSignup).toBe('function');
    });

    test('should be callable via window.trackUserSignup', async () => {
      jest.resetModules();
      (global.window as unknown as { gtag?: typeof mockGtag }).gtag = mockGtag;

      await import('../../../src/lib/utils/analytics');

      const windowTrackUserSignup = (global.window as unknown as { trackUserSignup?: (userId: string, method?: string) => void }).trackUserSignup;
      
      expect(windowTrackUserSignup).toBeDefined();
      
      if (windowTrackUserSignup) {
        windowTrackUserSignup('window-test-user', 'email');
        
        expect(mockGtag).toHaveBeenCalledWith('event', 'sign_up', {
          user_id: 'window-test-user',
          method: 'email',
        });
      }
    });
  });
});

