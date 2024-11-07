import { createClient } from "redis";

// Create Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL,
});

// Connect to Redis
export async function connectToRedis(retries = 5, delay = 5000) {
  try {
    await redisClient.connect();
    console.log(`\n☘️  Redis Connected! Db host: ${redisClient.options.url}\n`);
  } catch (err) {
    console.error("Error connecting to Redis:", err);
    if (retries > 0) {
      console.log(`Retrying connection in ${delay / 1000} seconds...`);
      setTimeout(() => connectToRedis(retries - 1, delay), delay);
    } else {
      console.error("Failed to connect to Redis after multiple attempts");
      process.exit(1); // Exit the process if unable to connect
    }
  }
}

// Call the connection function
// connectToRedis();

// Handle connection errors
redisClient.on("error", (err) => console.error("Redis Client Error:", err));

// Export Redis client methods
export const getAsync = redisClient.get.bind(redisClient);
export const setAsync = redisClient.set.bind(redisClient);
export const delAsync = redisClient.del.bind(redisClient);

export async function deleteCached(key) {
  await delAsync(key);
}

export async function getCached(key) {
  const cachedData = await getAsync(key);
  return cachedData ? JSON.parse(cachedData) : null;
}

export async function setCached(key, data, expirationInSeconds = 3600) {
  await setAsync(key, JSON.stringify(data), "EX", expirationInSeconds);
}

// Graceful shutdown
process.on("SIGINT", async () => {
  try {
    await redisClient.quit();
    console.log("Redis connection closed");
  } catch (err) {
    console.error("Error closing Redis connection:", err);
  } finally {
    process.exit(0);
  }
});

export default redisClient;
