/**
 * Backend Health Check Utility
 * Verifies backend services are reachable before critical operations
 */

import axios from 'axios'

interface HealthStatus {
  healthy: boolean
  service: string
  timestamp: string
  latency?: number
}

interface HealthCheckResult {
  auth: HealthStatus | null
  payment: HealthStatus | null
  allHealthy: boolean
}

const TIMEOUT_MS = 5000

/**
 * Check if auth service is healthy
 */
export async function checkAuthService(): Promise<HealthStatus | null> {
  const startTime = Date.now()
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3001'}/health`,
      { timeout: TIMEOUT_MS }
    )
    return {
      healthy: response.status === 200,
      service: response.data?.service || 'auth-service',
      timestamp: response.data?.timestamp || new Date().toISOString(),
      latency: Date.now() - startTime
    }
  } catch (error) {
    console.error('Auth service health check failed:', error)
    return null
  }
}

/**
 * Check if payment service is healthy
 */
export async function checkPaymentService(): Promise<HealthStatus | null> {
  const startTime = Date.now()
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_PAYMENT_URL || 'http://localhost:3003'}/health`,
      { timeout: TIMEOUT_MS }
    )
    return {
      healthy: response.status === 200,
      service: response.data?.service || 'payment-service',
      timestamp: response.data?.timestamp || new Date().toISOString(),
      latency: Date.now() - startTime
    }
  } catch (error) {
    console.error('Payment service health check failed:', error)
    return null
  }
}

/**
 * Check all backend services
 */
export async function checkAllServices(): Promise<HealthCheckResult> {
  const [auth, payment] = await Promise.all([
    checkAuthService(),
    checkPaymentService()
  ])

  return {
    auth,
    payment,
    allHealthy: auth?.healthy === true && payment?.healthy === true
  }
}

/**
 * Wait for service to become healthy (with retries)
 */
export async function waitForService(
  checkFn: () => Promise<HealthStatus | null>,
  maxRetries: number = 3,
  delayMs: number = 2000
): Promise<HealthStatus | null> {
  for (let i = 0; i < maxRetries; i++) {
    const status = await checkFn()
    if (status?.healthy) {
      return status
    }
    if (i < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }
  return null
}
