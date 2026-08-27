import { useEffect, useState } from 'react'
import { Archive, Boxes, CircleDollarSign, Download, Layers3, Pencil, Plus, SlidersHorizontal, Tag, Trash2 } from 'lucide-react'

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
    <div className="app-shell">
      <div className="container">
        <header className="topbar">
          <div className="brand-lockup">
            <div className="brand-mark"><Archive size={22} strokeWidth={2.5} /></div>
            <div>
              <p className="eyebrow">Toy Station / Operations</p>
              <h1>Inventory room</h1>
            </div>
          </div>
          <div className="actions">
            <button className="button button-secondary" onClick={() => window.location.href = '/api/items/export'}>
              <Download size={17} /> Export <span className="desktop-only">to Excel</span>
            </button>
          </div>
        </header>

        <section className="intro-row">
          <div>
            <p className="page-kicker">A tidy view of what is on the shelf</p>
            <p className="muted">Track stock, pricing, and the small details that keep every toy moving.</p>
          </div>
          <div className="status-pill"><span className="status-dot" /> Live inventory</div>
        </section>

        <section className="stats-grid" aria-label="Inventory summary">
          <div className="stat-card accent-yellow"><span className="stat-icon"><Boxes size={19} /></span><div><span className="stat-label">Items listed</span><strong>{items.length}</strong></div></div>
          <div className="stat-card accent-blue"><span className="stat-icon"><Layers3 size={19} /></span><div><span className="stat-label">Units in stock</span><strong>{items.reduce((total, item) => total + Number(item.quantity || 0), 0)}</strong></div></div>
          <div className="stat-card accent-coral"><span className="stat-icon"><CircleDollarSign size={19} /></span><div><span className="stat-label">Stock value</span><strong>${items.reduce((total, item) => total + Number(item.price || 0) * Number(item.quantity || 0), 0).toFixed(2)}</strong></div></div>
        </section>

        <section className="panel form-panel">
          <div className="section-heading"><div><p className="eyebrow">New arrival</p><h2>Add an item</h2></div><span className="heading-icon"><Plus size={20} /></span></div>
          <form onSubmit={addItem}>
            <input required placeholder="Name *" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} />
            <input placeholder="SKU" value={form.sku} onChange={e=>setForm({...form, sku: e.target.value})} />
            <input placeholder="Price" type="number" step="0.01" value={form.price} onChange={e=>setForm({...form, price: e.target.value})} />
            <input placeholder="Quantity" type="number" value={form.quantity} onChange={e=>setForm({...form, quantity: e.target.value})} />
            <input className="wide-input" placeholder="Tags (comma-separated)" value={form.tags} onChange={e=>setForm({...form, tags: e.target.value})} />
            <textarea className="wide-input" placeholder="Description" value={form.description} onChange={e=>setForm({...form, description: e.target.value})} />
            <button className="button button-primary" type="submit"><Plus size={17} /> Add to inventory</button>
          </form>
        </section>

        <section className="panel list-panel">
          <div className="section-heading list-heading"><div><p className="eyebrow">Current collection</p><h2>All items <span className="count-badge">{items.length}</span></h2></div><Tag className="muted-icon" size={22} /></div>
          {loading ? <p className="empty-state">Loading your inventory...</p> : items.length === 0 ? <div className="empty-state"><Boxes size={28} /><p>No items yet. Add the first toy above.</p></div> : (
            <div className="table-wrap"><table>
              <thead>
                <tr><th>Name</th><th>SKU</th><th>Price</th><th>Quantity</th><th>Tags</th><th><span className="sr-only">Actions</span></th></tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item._id}>
                    <td className="item-name">{item.name}</td><td className="sku">{item.sku || '—'}</td><td>${Number(item.price || 0).toFixed(2)}</td><td><span className={`quantity ${Number(item.quantity) === 0 ? 'quantity-empty' : ''}`}>{item.quantity}</span></td><td className="tags">{(item.tags||[]).join(', ') || '—'}</td>
                    <td className="row-actions"><button className="icon-button" aria-label={`Edit ${item.name}`} title="Edit item" onClick={()=>editItem(item)}><Pencil size={16} /></button><button className="icon-button" aria-label={`Adjust ${item.name}`} title="Adjust quantity" onClick={()=>adjustItem(item)}><SlidersHorizontal size={16} /></button><button className="icon-button danger" aria-label={`Delete ${item.name}`} title="Delete item" onClick={()=>removeItem(item._id)}><Trash2 size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          )}
        </section>
      </div>
    </div>
  )
}
