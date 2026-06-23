import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const songId = parseInt(id, 10)
    if (isNaN(songId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    const body = await request.json()
    const { title, artist, year, category, lyrics, sungCount, audioUrl } = body

    const updatedSong = await prisma.song.update({
      where: { id: songId },
      data: {
        ...(title && { title }),
        ...(artist && { artist }),
        ...(year && { year: parseInt(year, 10) }),
        ...(category && { category }),
        ...(lyrics !== undefined && { lyrics }),
        ...(sungCount !== undefined && { sungCount: parseInt(sungCount, 10) }),
        ...(audioUrl !== undefined && { audioUrl }),
      },
      include: { history: { orderBy: { sungAt: 'desc' } } }
    })

    return NextResponse.json(updatedSong)
  } catch (error) {
    console.error("Failed to update song", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const songId = parseInt(id, 10)
    if (isNaN(songId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    await prisma.song.delete({
      where: { id: songId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete song", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
