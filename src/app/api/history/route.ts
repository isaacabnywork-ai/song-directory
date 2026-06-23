import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { songId } = body
    
    if (!songId) {
      return NextResponse.json({ error: "Missing songId" }, { status: 400 })
    }

    const sId = parseInt(songId, 10)

    const newHistory = await prisma.songHistory.create({
      data: {
        songId: sId
      }
    })
    
    // Also increment sungCount for backward compatibility if needed, 
    // and fetch updated song with history
    const updatedSong = await prisma.song.update({
      where: { id: sId },
      data: {
        sungCount: { increment: 1 }
      },
      include: { history: { orderBy: { sungAt: 'desc' } } }
    })
    
    return NextResponse.json(updatedSong, { status: 201 })
  } catch (error) {
    console.error("Failed to add history", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
