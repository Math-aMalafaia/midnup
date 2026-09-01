import { useEffect, useState } from 'react'
import { PageHead } from './PageHead'
import { SectionTitle } from './Home'
import { supabase } from '../lib/supabase'

type Item = {
  id: number
  name: string
  description: string | null
  icon: string
  rarity: string
  type: string
  quantity?: number
  equipped?: boolean
}

type UserEquipmentRow = {
  quantity: number
  equipped: boolean
  equipment: Item | Item[] | null
}

export function Equipment() {
  const [gear, setGear] = useState<Item[]>([])
  const [owned, setOwned] = useState<Item[]>([])
  const [busy, setBusy] = useState<number | null>(null)
  const [error, setError] = useState('')

  async function load() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const [itemsResult, ownedResult] = await Promise.all([
      supabase.from('equipment').select('*').order('id'),
      supabase
        .from('user_equipment')
        .select('quantity, equipped, equipment(*)')
        .eq('user_id', user.id),
    ])

    if (itemsResult.error) throw itemsResult.error
    if (ownedResult.error) throw ownedResult.error

    setGear((itemsResult.data ?? []) as Item[])

    const rows = (ownedResult.data ?? []) as unknown as UserEquipmentRow[]
    const normalized = rows.flatMap((row) => {
      const equipment = Array.isArray(row.equipment)
        ? row.equipment
        : row.equipment
          ? [row.equipment]
          : []

      return equipment.map((item) => ({
        ...item,
        quantity: row.quantity,
        equipped: row.equipped,
      }))
    })

    setOwned(normalized)
  }

  useEffect(() => {
    load().catch((err) => {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar o equipamento.')
    })
  }, [])

  async function equip(id: number) {
    setBusy(id)
    setError('')

    try {
      const { error: rpcError } = await supabase.rpc('equip_item', {
        p_equipment_id: id,
      })

      if (rpcError) throw rpcError
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível equipar o item.')
    } finally {
      setBusy(null)
    }
  }

  const equippedItems = owned.filter((item) => item.equipped)

  return (
    <section className="sc">
      <div className="scr-scroll">
        <PageHead title="Equipment" sub="Equip gear to enhance your attributes." />

        {error && <p className="form-error">{error}</p>}

        <div className="panel">
          <h3>Equipped</h3>
          <div className="slots">
            {equippedItems.slice(0, 4).map((item) => (
              <div className="slot fill" key={item.id}>
                <span>{item.icon}</span>
                <small>{item.type}</small>
              </div>
            ))}

            {equippedItems.length === 0 && (
              <p className="empty-state">No equipment equipped yet.</p>
            )}
          </div>
        </div>

        <SectionTitle title="Inventory" />

        <div className="inv-grid">
          {gear.map((item) => {
            const ownedItem = owned.find((entry) => entry.id === item.id)

            return (
              <button
                className="item"
                key={item.id}
                disabled={!ownedItem || busy !== null}
                onClick={() => ownedItem && equip(item.id)}
              >
                <span>{item.icon}</span>
                <b>{item.name}</b>
                <small>
                  {ownedItem
                    ? `OWNED · ${ownedItem.quantity} · ${ownedItem.equipped ? 'EQUIPPED' : 'EQUIP'}`
                    : 'NOT OWNED'}{' '}
                  · {item.rarity.toUpperCase()}
                </small>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
