import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

const uri =
  process.env.MONGODB_URI ||
  'mongodb+srv://webstique_admin:VlMhjIbb3TEc7MVv@webstique.xzqsu2r.mongodb.net/Crystal-Estate?retryWrites=true&w=majority'

const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 15000,
  connectTimeoutMS: 15000,
}

let client = null
let clientPromise = null

export async function getClient() {
  if (!clientPromise) {
    client = new MongoClient(uri, options)
    clientPromise = client.connect().catch((err) => {
      console.warn('MongoDB connection error, will retry on next request:', err.message)
      client = null
      clientPromise = null
      throw err
    })
  }
  return clientPromise
}

export async function getDb(dbName = process.env.MONGODB_DB || 'Crystal-Estate') {
  const connectedClient = await getClient()
  return connectedClient.db(dbName)
}

export async function closeDb() {
  if (client) {
    await client.close()
    client = null
    clientPromise = null
  }
}

export default getClient
