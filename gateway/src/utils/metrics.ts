import { register, Counter, Histogram, Gauge } from 'prom-client';

// Request counter
export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code', 'service']
});

// Request duration histogram
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'service'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

// Active connections gauge
export const httpActiveConnections = new Gauge({
  name: 'http_active_connections',
  help: 'Number of active HTTP connections'
});

// Circuit breaker state gauge
export const circuitBreakerState = new Gauge({
  name: 'circuit_breaker_state',
  help: 'Circuit breaker state (0=CLOSED, 1=HALF_OPEN, 2=OPEN)',
  labelNames: ['service']
});

// Service health gauge
export const serviceHealth = new Gauge({
  name: 'service_health',
  help: 'Service health status (0=unhealthy, 1=degraded, 2=healthy)',
  labelNames: ['service']
});

// Error counter
export const httpErrorsTotal = new Counter({
  name: 'http_errors_total',
  help: 'Total number of HTTP errors',
  labelNames: ['method', 'route', 'status_code', 'service', 'error_type']
});

// Proxy request counter
export const proxyRequestsTotal = new Counter({
  name: 'proxy_requests_total',
  help: 'Total number of proxy requests',
  labelNames: ['service', 'status_code']
});

// Proxy request duration
export const proxyRequestDuration = new Histogram({
  name: 'proxy_request_duration_seconds',
  help: 'Duration of proxy requests in seconds',
  labelNames: ['service'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

// Rate limiting counter
export const rateLimitExceeded = new Counter({
  name: 'rate_limit_exceeded_total',
  help: 'Total number of rate limit violations',
  labelNames: ['route', 'ip']
});

// Authentication failures counter
export const authFailuresTotal = new Counter({
  name: 'auth_failures_total',
  help: 'Total number of authentication failures',
  labelNames: ['route', 'reason']
});

// Memory usage gauge
export const memoryUsage = new Gauge({
  name: 'nodejs_memory_usage_bytes',
  help: 'Memory usage in bytes',
  labelNames: ['type']
});

// CPU usage gauge
export const cpuUsage = new Gauge({
  name: 'nodejs_cpu_usage_percent',
  help: 'CPU usage percentage'
});

/**
 * Update circuit breaker state metric
 */
export function updateCircuitBreakerState(service: string, state: string): void {
  let stateValue = 0;
  switch (state) {
    case 'CLOSED':
      stateValue = 0;
      break;
    case 'HALF_OPEN':
      stateValue = 1;
      break;
    case 'OPEN':
      stateValue = 2;
      break;
  }
  circuitBreakerState.set({ service }, stateValue);
}

/**
 * Update service health metric
 */
export function updateServiceHealth(service: string, status: string): void {
  let healthValue = 0;
  switch (status) {
    case 'healthy':
      healthValue = 2;
      break;
    case 'degraded':
      healthValue = 1;
      break;
    case 'unhealthy':
      healthValue = 0;
      break;
  }
  serviceHealth.set({ service }, healthValue);
}

/**
 * Update memory usage metrics
 */
export function updateMemoryMetrics(): void {
  const memUsage = process.memoryUsage();
  memoryUsage.set({ type: 'rss' }, memUsage.rss);
  memoryUsage.set({ type: 'heapTotal' }, memUsage.heapTotal);
  memoryUsage.set({ type: 'heapUsed' }, memUsage.heapUsed);
  memoryUsage.set({ type: 'external' }, memUsage.external);
}

/**
 * Update CPU usage metric
 */
export function updateCpuMetrics(): void {
  const startUsage = process.cpuUsage();
  setTimeout(() => {
    const endUsage = process.cpuUsage(startUsage);
    const cpuPercent = (endUsage.user + endUsage.system) / 1000000; // Convert to seconds
    cpuUsage.set(cpuPercent);
  }, 100);
}

/**
 * Start metrics collection
 */
export function startMetricsCollection(): void {
  // Update memory metrics every 30 seconds
  setInterval(updateMemoryMetrics, 30000);
  
  // Update CPU metrics every 10 seconds
  setInterval(updateCpuMetrics, 10000);
  
  // Initial metrics update
  updateMemoryMetrics();
  updateCpuMetrics();
}

/**
 * Get metrics as string
 */
export async function getMetrics(): Promise<string> {
  return register.metrics();
}

/**
 * Reset all metrics (useful for testing)
 */
export function resetMetrics(): void {
  register.clear();
}

export default register; 