import { prisma } from '@/lib/prisma'
import MainApp from '@/components/MainApp'

export const dynamic = 'force-dynamic';

export default async function Page() {
  const songs = await prisma.song.findMany({
    orderBy: { title: 'asc' },
    include: { history: { orderBy: { sungAt: 'desc' } } }
  })

  // Auto-backfill: If any song has sungCount > 0 but history is empty, create a history entry
  for (const song of songs) {
    if (song.sungCount > 0 && song.history.length === 0) {
      try {
        const created = await prisma.songHistory.create({
          data: {
            songId: song.id,
            sungAt: new Date()
          }
        })
        song.history = [created]
      } catch (e) {
        console.error("Error backfilling history for song", song.id, e)
      }
    }
  }

  const serializedSongs = songs.map(song => ({
    ...song,
    history: song.history?.map(h => ({
      id: h.id,
      sungAt: h.sungAt instanceof Date ? h.sungAt.toISOString() : String(h.sungAt)
    })) || []
  }))

  return (
    <MainApp initialSongs={serializedSongs} />
  )
}
