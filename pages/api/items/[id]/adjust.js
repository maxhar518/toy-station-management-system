import dbConnect from '../../../../lib/mongoose'
import Item from '../../../../models/Item'

export default async function handler(req, res) {
  const { method } = req
  const { id } = req.query
  await dbConnect()

  if (method === 'PATCH') {
    try {
      const { delta } = req.body
      const d = Number(delta)
      if (!Number.isFinite(d)) return res.status(400).json({ ok: false, error: 'Invalid delta' })

      const item = await Item.findById(id)
      if (!item) return res.status(404).json({ ok: false, error: 'Item not found' })

      item.quantity += d
      if (item.quantity < 0) item.quantity = 0
      await item.save()

      return res.status(200).json({ ok: true, item })
    } catch (err) {
      console.error(err)
      return res.status(500).json({ ok: false, error: 'Failed to adjust quantity' })
    }
  }

  res.setHeader('Allow', ['PATCH'])
  res.status(405).end(`Method ${method} Not Allowed`)
}
