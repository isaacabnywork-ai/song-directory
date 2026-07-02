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

export async function DELETE(request: Request) {
  try {
    // 1. Delete all song history entries
    await prisma.songHistory.deleteMany({});
    
    // 2. Reset sungCount of all songs to 0
    await prisma.song.updateMany({
      data: {
        sungCount: 0
      }
    });

    return NextResponse.json({ success: true, message: "All song history and sung counts have been reset." });
  } catch (error) {
    console.error("Failed to reset history", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

