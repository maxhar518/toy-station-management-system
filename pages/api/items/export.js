import dbConnect from '../../../lib/mongoose'
import Item from '../../../models/Item'
import XLSX from 'xlsx'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  await dbConnect()

  try {
    const items = await Item.find().lean()
    const data = items.map(i => ({
      id: i._id.toString(),
      name: i.name,
      sku: i.sku || '',
      description: i.description || '',
      price: i.price || 0,
      quantity: i.quantity || 0,
      tags: (i.tags || []).join(', '),
      createdAt: i.createdAt,
      updatedAt: i.updatedAt
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Items')

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    res.setHeader('Content-Disposition', 'attachment; filename="toy-station-items.xlsx"')
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    return res.status(200).send(buf)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ ok: false, error: 'Failed to export items' })
  }
}
