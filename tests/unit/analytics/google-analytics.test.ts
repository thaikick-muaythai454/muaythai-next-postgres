import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';

type MockedThirdParty = typeof import('@next/third-parties/google');

const MOCK_COMPONENT_SYMBOL = Symbol('MockGoogleAnalytics');

jest.mock('@next/third-parties/google', () => ({
  GoogleAnalytics: Object.assign(
    (props: { gaId: string }) => ({
      $$typeof: MOCK_COMPONENT_SYMBOL,
      props,
    }),
    { displayName: 'MockGoogleAnalytics' }
  ),
}), { virtual: true });

const originalEnv = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = { ...originalEnv };
});

afterEach(() => {
  process.env = originalEnv;
  jest.restoreAllMocks();
});

describe('GoogleAnalytics component', () => {
  test('renders third-party GA script when measurement ID is set', async () => {
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TEST123';

    const thirdParty = await import('@next/third-parties/google') as MockedThirdParty;
    const { GoogleAnalytics } = await import('@/components/shared/analytics/GoogleAnalytics');

    const element = GoogleAnalytics();

    expect(element).not.toBeNull();
    expect(element?.props).toEqual({ gaId: 'G-TEST123' });
    expect(element?.type).toBe(thirdParty.GoogleAnalytics);
  });

  test('warns and renders nothing when measurement ID is missing', async () => {
    delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const thirdParty = await import('@next/third-parties/google') as MockedThirdParty;
    const { GoogleAnalytics } = await import('@/components/shared/analytics/GoogleAnalytics');

    const element = GoogleAnalytics();

    expect(warnSpy).toHaveBeenCalledWith('Google Analytics: NEXT_PUBLIC_GA_MEASUREMENT_ID is not set');
    expect(element).toBeNull();
  });
});

