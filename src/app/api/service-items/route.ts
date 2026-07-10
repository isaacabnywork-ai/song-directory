import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const items = await prisma.serviceItem.findMany({
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(items)
  } catch (error) {
    console.error("Failed to fetch service items", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    // It can be a list of items to update/create, or a single item
    // Since we're editing a whole table, maybe it's easiest to just replace the whole order,
    // or upsert based on ID. 
    // Let's implement a bulk update for the whole order of service since it's an editable table.
    // If it's a bulk save:
    if (Array.isArray(body)) {
      // Clear existing and insert new to maintain order and sync perfectly?
      // Better yet, just delete all and insert many for a simple "Order of Service" sync
      // BUT if we want to avoid deleting, we can do it in a transaction
      await prisma.$transaction(async (tx) => {
        await tx.serviceItem.deleteMany({})
        if (body.length > 0) {
          await tx.serviceItem.createMany({
            data: body.map((item, index) => ({
              startTime: item.startTime || null,
              endTime: item.endTime || null,
              event: item.event || '',
              responsible: item.responsible || null,
              content: item.content || null,
              isHeader: item.isHeader || false,
              order: index
            }))
          })
        }
      })
      
      const newItems = await prisma.serviceItem.findMany({
        orderBy: { order: 'asc' },
      })
      return NextResponse.json(newItems, { status: 201 })
    }

    return NextResponse.json({ error: "Invalid body format, expected an array of items" }, { status: 400 })
  } catch (error) {
    console.error("Failed to save service items", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
