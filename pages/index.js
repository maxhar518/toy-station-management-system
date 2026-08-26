import { useEffect, useState } from 'react'

export default function Home() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', sku: '', price: '', quantity: '', tags: '', description: '' })

  useEffect(() => {
    fetchItems()
  }, [])

  async function fetchItems() {
    setLoading(true)
    const res = await fetch('/api/items')
    const data = await res.json()
    if (data?.ok) setItems(data.items)
    setLoading(false)
  }

  async function addItem(e) {
    e.preventDefault()
    const body = {
      name: form.name,
      sku: form.sku,
      price: Number(form.price || 0),
      quantity: Number(form.quantity || 0),
      tags: form.tags ? form.tags.split(',').map(s=>s.trim()) : [],
      description: form.description
    }
    const res = await fetch('/api/items', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await res.json()
    if (data?.ok) {
      setForm({ name: '', sku: '', price: '', quantity: '', tags: '', description: '' })
      fetchItems()
    } else {
      alert(data.error || 'Failed')
    }
  }

  async function removeItem(id) {
    if (!confirm('Delete this item?')) return
    const res = await fetch(`/api/items/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data?.ok) fetchItems()
    else alert(data.error || 'Failed')
  }

  async function editItem(item) {
    const name = prompt('Name', item.name)
    if (name === null) return
    const price = prompt('Price', String(item.price || 0))
    if (price === null) return
    const quantity = prompt('Quantity', String(item.quantity || 0))
    if (quantity === null) return
    const sku = prompt('SKU', item.sku || '')
    if (sku === null) return
    const tags = prompt('Tags (comma-separated)', (item.tags||[]).join(', '))
    if (tags === null) return

    const body = { name, price: Number(price), quantity: Number(quantity), sku, tags }
    const res = await fetch(`/api/items/${item._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await res.json()
    if (data?.ok) fetchItems()
    else alert(data.error || 'Failed')
  }

  async function adjustItem(item) {
    const delta = prompt('Quantity change (use negative numbers to remove)', '1')
    if (delta === null) return
    const res = await fetch(`/api/items/${item._id}/adjust`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ delta: Number(delta) }) })
    const data = await res.json()
    if (data?.ok) fetchItems()
    else alert(data.error || 'Failed')
  }

  return (
    <div className="container">
      <header>
        <h1>Toy Station — Inventory</h1>
        <div className="actions">
          <button onClick={() => window.location.href = '/api/items/export'}>Export to Excel</button>
        </div>
      </header>

      <section className="form">
        <h2>Add item</h2>
        <form onSubmit={addItem}>
          <input required placeholder="Name" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} />
          <input placeholder="SKU" value={form.sku} onChange={e=>setForm({...form, sku: e.target.value})} />
          <input placeholder="Price" type="number" step="0.01" value={form.price} onChange={e=>setForm({...form, price: e.target.value})} />
          <input placeholder="Quantity" type="number" value={form.quantity} onChange={e=>setForm({...form, quantity: e.target.value})} />
          <input placeholder="Tags (comma-separated)" value={form.tags} onChange={e=>setForm({...form, tags: e.target.value})} />
          <textarea placeholder="Description" value={form.description} onChange={e=>setForm({...form, description: e.target.value})} />
          <button type="submit">Add</button>
        </form>
      </section>

      <section className="list">
        <h2>Items</h2>
        {loading ? <p>Loading…</p> : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Tags</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item._id}>
                  <td>{item.name}</td>
                  <td>{item.sku}</td>
                  <td>{item.price}</td>
                  <td>{item.quantity}</td>
                  <td>{(item.tags||[]).join(', ')}</td>
                  <td>
                    <button onClick={()=>editItem(item)}>Edit</button>
                    <button onClick={()=>adjustItem(item)}>Adjust</button>
                    <button onClick={()=>removeItem(item._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <footer>
        <p>Deploy this app to Vercel and set MONGODB_URI in Environment Variables.</p>
      </footer>

      <style jsx>{`
        .container { max-width: 980px; margin: 24px auto; padding: 0 16px; }
        header { display:flex; justify-content:space-between; align-items:center; }
        .form { margin-top: 20px; }
        form { display:flex; flex-wrap:wrap; gap:8px; }
        form input, form textarea { padding:8px; flex:1 1 200px; }
        form textarea { min-height:64px; }
        table { width:100%; border-collapse:collapse; margin-top:16px; }
        th, td { border:1px solid #ddd; padding:8px; text-align:left; }
        button { margin-right:6px; }
      `}</style>
    </div>
  )
}
