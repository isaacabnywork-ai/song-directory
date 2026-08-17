import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { songId, sungAt } = body
    
    if (!songId) {
      return NextResponse.json({ error: "Missing songId" }, { status: 400 })
    }

    const sId = parseInt(songId, 10)
    const historyDate = sungAt ? new Date(sungAt) : new Date()

    await prisma.songHistory.create({
      data: {
        songId: sId,
        sungAt: isNaN(historyDate.getTime()) ? new Date() : historyDate
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

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const historyId = searchParams.get('historyId')

    if (historyId) {
      const hId = parseInt(historyId, 10)
      const existing = await prisma.songHistory.findUnique({
        where: { id: hId }
      })

      if (!existing) {
        return NextResponse.json({ error: "History record not found" }, { status: 404 })
      }

      await prisma.songHistory.delete({
        where: { id: hId }
      })

      // Recalculate sungCount and return updated song
      const remainingCount = await prisma.songHistory.count({
        where: { songId: existing.songId }
      })

      const updatedSong = await prisma.song.update({
        where: { id: existing.songId },
        data: { sungCount: remainingCount },
        include: { history: { orderBy: { sungAt: 'desc' } } }
      })

      return NextResponse.json({ success: true, song: updatedSong })
    }

    // 1. Delete all song history entries
    await prisma.songHistory.deleteMany({})
    
    // 2. Reset sungCount of all songs to 0
    await prisma.song.updateMany({
      data: {
        sungCount: 0
      }
    })

    return NextResponse.json({ success: true, message: "All song history and sung counts have been reset." })
  } catch (error) {
    console.error("Failed to reset/delete history", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

