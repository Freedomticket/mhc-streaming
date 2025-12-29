#!/usr/bin/env tsx
/**
 * MHC Streaming API Health Check Script
 * Monitors all backend services on Render
 * Run: npx tsx scripts/check-api-health.ts
 */

import axios from 'axios';

interface ServiceConfig {
  name: string;
  url: string;
  healthEndpoint?: string;
  required: boolean;
}

const services: ServiceConfig[] = [
  {
    name: 'Auth Service',
    url: 'https://mhc-auth-service.onrender.com',
    healthEndpoint: '/health',
    required: true,
  },
  {
    name: 'Payment Service',
    url: 'https://mhc-payment-service.onrender.com',
    healthEndpoint: '/health',
    required: true,
  },
  {
    name: 'Media Service',
    url: 'https://mhc-media-service.onrender.com',
    healthEndpoint: '/health',
    required: true,
  },
  {
    name: 'API Gateway',
    url: 'https://mhc-api-gateway.onrender.com',
    healthEndpoint: '/health',
    required: true,
  },
];

interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'unhealthy' | 'not-deployed';
  latency?: number;
  error?: string;
  data?: any;
}

async function checkService(
  service: ServiceConfig
): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  try {
    const response = await axios.get(
      `${service.url}${service.healthEndpoint || '/health'}`,
      {
        timeout: 10000,
        validateStatus: (status) => status < 500, // Accept 4xx as valid response
      }
    );
    
    const latency = Date.now() - startTime;
    
    if (response.status === 200) {
      return {
        service: service.name,
        status: 'healthy',
        latency,
        data: response.data,
      };
    } else if (response.status === 404) {
      // Service exists but no health endpoint
      return {
        service: service.name,
        status: 'healthy',
        latency,
        data: { note: 'No health endpoint, but service responded' },
      };
    } else {
      return {
        service: service.name,
        status: 'unhealthy',
        latency,
        error: `HTTP ${response.status}`,
      };
    }
  } catch (error: any) {
    const latency = Date.now() - startTime;
    
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return {
        service: service.name,
        status: 'not-deployed',
        latency,
        error: 'Service not accessible (possibly not deployed)',
      };
    }
    
    return {
      service: service.name,
      status: 'unhealthy',
      latency,
      error: error.message,
    };
  }
}

async function main() {
  console.log('🔍 MHC Streaming API Health Check\n');
  console.log('='.repeat(60));
  console.log('');

  const results = await Promise.all(services.map(checkService));

  let allHealthy = true;
  let criticalDown = false;

  results.forEach((result) => {
    const service = services.find((s) => s.name === result.service)!;
    
    let icon = '✅';
    let statusText = 'HEALTHY';
    
    if (result.status === 'unhealthy') {
      icon = '❌';
      statusText = 'UNHEALTHY';
      allHealthy = false;
      if (service.required) criticalDown = true;
    } else if (result.status === 'not-deployed') {
      icon = service.required ? '❌' : '⚠️';
      statusText = 'NOT DEPLOYED';
      if (service.required) {
        allHealthy = false;
        criticalDown = true;
      }
    }

    console.log(`${icon} ${result.service}`);
    console.log(`   Status: ${statusText}`);
    console.log(`   URL: ${service.url}`);
    
    if (result.latency) {
      console.log(`   Latency: ${result.latency}ms`);
    }
    
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    
    if (result.data) {
      console.log(`   Data: ${JSON.stringify(result.data, null, 2).substring(0, 100)}...`);
    }
    
    console.log('');
  });

  console.log('='.repeat(60));
  
  if (criticalDown) {
    console.log('\n❌ CRITICAL: Required services are down!');
    process.exit(1);
  } else if (!allHealthy) {
    console.log('\n⚠️  WARNING: Some optional services are not available');
    process.exit(0);
  } else {
    console.log('\n✅ All services are healthy!');
    process.exit(0);
  }
}

main();
