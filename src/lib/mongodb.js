import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/roomiefit";
const options = {};

let client;

if (process.env.NODE_ENV === "development") {
  // Use a global variable to preserve the client across HMR reloads
  if (!global._mongoClient) {
    global._mongoClient = new MongoClient(uri, options);
  }
  client = global._mongoClient;
} else {
  client = new MongoClient(uri, options);
}

// Export clientPromise to match standard patterns
const clientPromise = Promise.resolve(client);

export function getDb() {
  return client.db(process.env.MONGODB_DB_NAME || "roomiefit");
}

export default clientPromise;
export { client };
