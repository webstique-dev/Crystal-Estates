import { MongoClient } from 'mongodb'

const uri =
  process.env.MONGODB_URI ||
  'mongodb+srv://webstique_admin:VlMhjIbb3TEc7MVv@webstique.xzqsu2r.mongodb.net/Crystal-Estate?retryWrites=true&w=majority'

const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
}

let client
let clientPromise

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR.
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise

export async function getDb(dbName = process.env.MONGODB_DB || 'Crystal-Estate') {
  const client = await clientPromise
  return client.db(dbName)
}

