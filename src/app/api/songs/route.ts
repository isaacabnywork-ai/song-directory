import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const songs = await prisma.song.findMany({
      orderBy: { title: 'asc' }
    })
    return NextResponse.json(songs)
  } catch (error) {
    console.error("Failed to fetch songs", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, artist, year, category, lyrics } = body
    
    if (!title || !artist || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newSong = await prisma.song.create({
      data: {
        title,
        artist,
        year: year ? parseInt(year, 10) : new Date().getFullYear(),
        category,
        lyrics: lyrics || null,
      }
    })
    
    return NextResponse.json(newSong, { status: 201 })
  } catch (error) {
    console.error("Failed to create song", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
