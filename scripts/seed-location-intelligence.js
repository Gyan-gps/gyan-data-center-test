import fetch from "node-fetch";

const endpoints = [
  "http://localhost:8080/api/location-intelligence/summary",
  "http://localhost:8080/api/location-intelligence/ranking",
  "http://localhost:8080/api/location-intelligence/capacity",
  "http://localhost:8080/api/location-intelligence/city-wise",
  "http://localhost:8080/api/location-intelligence/competition",
  "http://localhost:8080/api/location-intelligence/supply",
  "http://localhost:8080/api/location-intelligence/dc-list"
];

const payload = {
  page: 1,
  pageSize: 5,
  base_quarter: 1,
  base_year: 2026
};

async function run() {
  console.log("Seeding location intelligence data...");
  console.log("Filters used:", JSON.stringify(payload, null, 2));
  
  for (const url of endpoints) {
    try {
      console.log(`\nCalling ${url}...`);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Success! Response preview:`, JSON.stringify(data).substring(0, 150) + '...');
    } catch (e) {
      console.error(`Error calling ${url}:`, e.message);
    }
  }
  
  console.log("\nFinished seeding location intelligence data.");
}

run();
