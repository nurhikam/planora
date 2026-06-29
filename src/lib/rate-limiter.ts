import { RateLimiterMemory, RateLimiterRes } from "rate-limiter-flexible";

export const loginRateLimiter = new RateLimiterMemory({
  points: 10,
  duration: 60,
  blockDuration: 300,
});

export const registerRateLimiter = new RateLimiterMemory({
  points: 10,
  duration: 3600,
  blockDuration: 1800,
});

export const verifyRateLimiter = new RateLimiterMemory({
  points: 20,
  duration: 60,
  blockDuration: 300,
});

export async function checkRateLimit(
  limiter: RateLimiterMemory,
  key: string,
): Promise<{
  success: boolean;
  remainingPoints?: number;
  msBeforeNext?: number;
}> {
  try {
    const res = await limiter.consume(key);
    return {
      success: true,
      remainingPoints: res.remainingPoints,
      msBeforeNext: res.msBeforeNext,
    };
  } catch (error) {
    if (error instanceof RateLimiterRes) {
      return {
        success: false,
        remainingPoints: error.remainingPoints,
        msBeforeNext: error.msBeforeNext,
      };
    }
    throw error;
  }
}
