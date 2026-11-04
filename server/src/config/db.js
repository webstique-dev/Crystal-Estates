import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

const uri =
  process.env.MONGODB_URI ||
  'mongodb+srv://webstique_admin:VlMhjIbb3TEc7MVv@webstique.xzqsu2r.mongodb.net/Crystal-Estate?retryWrites=true&w=majority'

const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
}

let client
let clientPromise

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options)
  global._mongoClientPromise = client.connect()
}
clientPromise = global._mongoClientPromise

export default clientPromise

/**
 * Returns a reference to the MongoDB database.
 * @param {string} [dbName]
 * @returns {Promise<import('mongodb').Db>}
 */
export async function getDb(dbName = process.env.MONGODB_DB || 'Crystal-Estate') {
  const connectedClient = await clientPromise
  return connectedClient.db(dbName)
}

/**
 * Closes the MongoDB connection (for graceful shutdown).
 */
export async function closeDb() {
  if (client) {
    await client.close()
    global._mongoClientPromise = null
  }
}

