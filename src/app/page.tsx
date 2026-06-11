import { prisma } from '@/lib/prisma'
import MainApp from '@/components/MainApp'

export const dynamic = 'force-dynamic';

export default async function Page() {
  const songs = await prisma.song.findMany({
    orderBy: { title: 'asc' }
  })

  return (
    <MainApp initialSongs={songs} />
  )
}
