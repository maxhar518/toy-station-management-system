import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
  console.warn('DB-NotConnected: MONGODB_URI not set. Set it in your environment variables.')
}

/**
 * Global is used here to maintain a cached connection across hot reloads in
 * development. This prevents connections growing exponentially during API route
 * calls.
 */
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function dbConnect() {
  if (cached.conn) {
    console.info('Db_Connected (cached)')
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      // other mongoose options can go here
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.info('Db_Connected')
        return mongoose
      })
      .catch((err) => {
        console.error('DB_error', err)
        cached.promise = null
        throw err
      })
  }

  try {
    cached.conn = await cached.promise
  } catch (err) {
    console.error('DB_error', err)
    throw err
  }
  return cached.conn
}

export default dbConnect
