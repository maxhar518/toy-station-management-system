import dbConnect from '../../../../lib/mongoose'
import Item from '../../../../models/Item'

export default async function handler(req, res) {
  const { method } = req
  const { id } = req.query

  await dbConnect()

  if (method === 'GET') {
    try {
      const item = await Item.findById(id).lean()
      if (!item) return res.status(404).json({ ok: false, error: 'Item not found' })
      return res.status(200).json({ ok: true, item })
    } catch (err) {
      console.error(err)
      return res.status(500).json({ ok: false, error: 'Failed to fetch item' })
    }
  }

  if (method === 'PUT') {
    try {
      const { name, sku, description, price, quantity, tags } = req.body
      const updates = {
        ...(name !== undefined && { name }),
        ...(sku !== undefined && { sku }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: Number(price) }),
        ...(quantity !== undefined && { quantity: Number(quantity) }),
        ...(tags !== undefined && { tags: Array.isArray(tags) ? tags : String(tags).split(',').map(s=>s.trim()) })
      }
      const item = await Item.findByIdAndUpdate(id, updates, { new: true })
      if (!item) return res.status(404).json({ ok: false, error: 'Item not found' })
      return res.status(200).json({ ok: true, item })
    } catch (err) {
      console.error(err)
      return res.status(500).json({ ok: false, error: 'Failed to update item' })
    }
  }

  if (method === 'DELETE') {
    try {
      const item = await Item.findByIdAndDelete(id)
      if (!item) return res.status(404).json({ ok: false, error: 'Item not found' })
      return res.status(200).json({ ok: true })
    } catch (err) {
      console.error(err)
      return res.status(500).json({ ok: false, error: 'Failed to delete item' })
    }
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
  res.status(405).end(`Method ${method} Not Allowed`)
}
