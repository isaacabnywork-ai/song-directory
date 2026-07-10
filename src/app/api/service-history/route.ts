import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const history = await prisma.serviceOrderHistory.findMany({
      orderBy: { date: 'desc' },
    })
    return NextResponse.json(history)
  } catch (error) {
    console.error("Failed to fetch service history", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { date, items } = body

    if (!date || !items) {
      return NextResponse.json({ error: "Missing date or items" }, { status: 400 })
    }

    const parsedDate = new Date(date)

    // Use upsert to create or update the history for that specific date
    const historyEntry = await prisma.serviceOrderHistory.upsert({
      where: { date: parsedDate },
      update: { items },
      create: { date: parsedDate, items },
    })

    return NextResponse.json(historyEntry, { status: 201 })
  } catch (error) {
    console.error("Failed to save service history", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: "Missing id parameter" }, { status: 400 })
    }

    await prisma.serviceOrderHistory.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete service history", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
