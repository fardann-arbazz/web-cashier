import http from "k6/http";
import { check, sleep } from "k6";
import { Counter, Rate } from "k6/metrics";

// Custom metrics untuk monitoring tambahan
const errorRate = new Rate("error_rate");
const successfulRequests = new Counter("successful_requests");

export let options = {
  stages: [
    { duration: "10s", target: 50 },   // naik ke 50 user
    { duration: "20s", target: 100 },  // stabil di 100 user
    { duration: "10s", target: 0 },    // turun ke 0 user
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"],  // 95% request di bawah 500ms
    http_req_failed: ["rate<0.05"],    // error rate di bawah 5%
  },
};

export default function () {
  const res = http.get("http://localhost:8080/barang", {
    headers: {
      Authorization: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsInVzZXJfaWQiOjEsInJvbGUiOiJhZG1pbiIsImV4cCI6MTc1MzUyMDM1OX0.cVzX5I574y5D4UprrEVsDXDJwGRk43ONhHYWjsSMKqg`,
    },
    timeout: "10s",
  });

  // Debug info - hanya tampil sekali di awal
  if (__ITER === 0 && __VU === 1) {
    console.log(`=== DEBUG INFO ===`);
    console.log(`Status: ${res.status}`);
    console.log(`Response time: ${res.timings.duration}ms`);
    console.log(`Response body: ${res.body.substring(0, 200)}...`);
    
    if (res.status !== 200) {
      console.log(`❌ Error response: ${res.body}`);
    }
  }

  // Enhanced checks
  const result = check(res, {
    "status is 200": (r) => r.status === 200,
    "body is not empty": (r) => r.body.length > 0,
    "response time < 500ms": (r) => r.timings.duration < 500,
    "valid JSON response": (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch (e) {
        return false;
      }
    },
  });

  // Track success/error metrics
  if (result) {
    successfulRequests.add(1);
  } else {
    errorRate.add(1);
  }

  // OPTIMIZED: sleep 0.1 detik untuk throughput yang lebih tinggi
  sleep(0.1);
}

export function handleSummary(data) {
  const successRate = ((1 - data.metrics.http_req_failed.rate) * 100).toFixed(2);
  const errorRate = (data.metrics.http_req_failed.rate * 100).toFixed(2);
  
  return {
    stdout: `
📊 === LOAD TEST RESULTS ===
⏱️  Duration: ${(data.metrics.iteration_duration.avg / 1000).toFixed(2)}s avg per iteration
📈 Total Requests: ${data.metrics.http_reqs.count}
✅ Success Rate: ${successRate}%
❌ Error Rate: ${errorRate}%
⚡ Requests/sec: ${data.metrics.http_reqs.rate.toFixed(2)} req/s
🕐 Avg Response Time: ${data.metrics.http_req_duration.avg.toFixed(2)}ms
🔥 P95 Response Time: ${data.metrics.http_req_duration["p(95)"].toFixed(2)}ms

📋 === PERFORMANCE ANALYSIS ===
${data.metrics.http_req_failed.rate > 0.1 
  ? "❌ KRITIK: Error rate tinggi! Cek koneksi dan server." 
  : "✅ Error rate normal."
}
${data.metrics.http_req_duration["p(95)"] > 500 
  ? "⚠️  PERINGATAN: Response time tinggi. Perlu optimisasi." 
  : "✅ Response time bagus."
}
${data.metrics.http_reqs.rate > 500 
  ? "🚀 EXCELLENT: Throughput tinggi!" 
  : data.metrics.http_reqs.rate > 200 
    ? "✅ Throughput normal." 
    : "⚠️  Throughput rendah, mungkin ada bottleneck."
}

🎯 === REKOMENDASI ===
- Target response time: < 100ms untuk GET sederhana
- Target throughput: > 1000 req/s untuk API Rust yang optimal
- Target error rate: < 1%
    `,
  };
}