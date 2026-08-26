import mongoose from 'mongoose'

const ItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, trim: true, index: true },
    description: { type: String, trim: true },
    price: { type: Number, default: 0 },
    quantity: { type: Number, default: 0 },
    tags: { type: [String], default: [] }
  },
  { timestamps: true }
)

// Prevent model overwrite upon hot reloads in development
export default mongoose.models.Item || mongoose.model('Item', ItemSchema)
