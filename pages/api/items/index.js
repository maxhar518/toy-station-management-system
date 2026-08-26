import dbConnect from '../../../lib/mongoose'
import Item from '../../../models/Item'

export default async function handler(req, res) {
  const { method } = req
  await dbConnect()

  if (method === 'GET') {
    try {
      const items = await Item.find().sort({ createdAt: -1 }).lean()
      return res.status(200).json({ ok: true, items })
    } catch (err) {
      console.error(err)
      return res.status(500).json({ ok: false, error: 'Failed to fetch items' })
    }
  }

  if (method === 'POST') {
    try {
      const { name, sku, description, price, quantity, tags } = req.body
      if (!name) return res.status(400).json({ ok: false, error: 'Name is required' })

      const item = new Item({
        name,
        sku,
        description,
        price: Number(price || 0),
        quantity: Number(quantity || 0),
        tags: Array.isArray(tags) ? tags : (tags ? String(tags).split(',').map(s => s.trim()) : [])
      })

      await item.save()
      return res.status(201).json({ ok: true, item })
    } catch (err) {
      console.error(err)
      return res.status(500).json({ ok: false, error: 'Failed to create item' })
    }
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${method} Not Allowed`)
}
