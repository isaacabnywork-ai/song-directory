import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const setlist = await prisma.sundaySetlist.findMany({
      orderBy: { order: 'asc' },
      include: { 
        song: {
          include: { history: { orderBy: { sungAt: 'desc' } } }
        } 
      }
    })
    const songs = setlist.map(s => s.song)
    return NextResponse.json(songs)
  } catch (error) {
    console.error("Failed to fetch setlist", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { songId } = body
    
    if (!songId) {
      return NextResponse.json({ error: "Missing songId" }, { status: 400 })
    }

    const sId = parseInt(songId, 10)
    
    // get max order
    const maxOrder = await prisma.sundaySetlist.findFirst({
      orderBy: { order: 'desc' }
    })
    
    const newOrder = maxOrder ? maxOrder.order + 1 : 1

    await prisma.sundaySetlist.upsert({
      where: { songId: sId },
      update: {}, // if it exists, do nothing
      create: { songId: sId, order: newOrder }
    })
    
    // fetch updated setlist
    const setlist = await prisma.sundaySetlist.findMany({
      orderBy: { order: 'asc' },
      include: { 
        song: {
          include: { history: { orderBy: { sungAt: 'desc' } } }
        } 
      }
    })
    const songs = setlist.map(s => s.song)
    return NextResponse.json(songs, { status: 201 })
  } catch (error) {
    console.error("Failed to add to setlist", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const songId = searchParams.get('songId')
    
    if (!songId) {
      return NextResponse.json({ error: "Missing songId" }, { status: 400 })
    }

    const sId = parseInt(songId, 10)

    await prisma.sundaySetlist.deleteMany({
      where: { songId: sId }
    })
    
    const setlist = await prisma.sundaySetlist.findMany({
      orderBy: { order: 'asc' },
      include: { 
        song: {
          include: { history: { orderBy: { sungAt: 'desc' } } }
        } 
      }
    })
    const songs = setlist.map(s => s.song)
    return NextResponse.json(songs)
  } catch (error) {
    console.error("Failed to remove from setlist", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
