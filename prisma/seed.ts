import { prisma } from '../src/lib/prisma'

const songs = [
  { id: 1, title: "अपने हाथों से मुझे चलाता (Apne haathon)", artist: "SVC Worship", year: 2024, category: "A-C", lyrics: "[D]अपने हाथों से [G]मुझे च[D]लाता\n[D]मेरी राहों को [A]वो है स[D]जाता\n\n[G]आँधी और [D]तूफान में भी\n[A]वो मेरा [D]सहारा\n[D]यीशु मेरा [A]प्यारा [D]सहारा" },
  { id: 2, title: "अपने प्रभु को पहचानने वाले (Apne Prabhu ko)", artist: "SVC Worship", year: 2024, category: "A-C", lyrics: "[C]अपने प्रभु को [F]पहचानने [C]वाले\n[G]कभी ना [C]हारे\n\n[C]जय मसीह की [F]बोलते [C]जाओ\n[G]आगे बढ़ते [C]जाओ" },
  { id: 3, title: "आओ आनन्द मनाएं (Aao anand manaye)", artist: "SVC Worship", year: 2024, category: "A-C" },
  { id: 4, title: "आओ हम यहोवा का धन्यवाद करें (Aao ham yahova)", artist: "SVC Worship", year: 2024, category: "A-C" },
  { id: 5, title: "बोल हे प्रभु, हम तो आए हैं (Bol hai prabhu)", artist: "SVC Worship", year: 2024, category: "A-C" },
  { id: 6, title: "दिन में बादल का छाया बना (Din mein baadal)", artist: "SVC Worship", year: 2024, category: "D-H" },
  { id: 7, title: "देखो देखो कोई आ रहा है (Dekho dekho koee aa raha hai)", artist: "SVC Worship", year: 2024, category: "D-H" },
  { id: 8, title: "धन्यवाद सदा प्रभु ख्रीष्ट तुझे (Dhanyavad Sada Prabhu)", artist: "SVC Worship", year: 2024, category: "D-H" },
  { id: 9, title: "हम पथिक हैं कटीले पथ के (Ham pathik hain)", artist: "SVC Worship", year: 2024, category: "D-H" },
  { id: 10, title: "हे करुणा निधान तू यीशु महान (He karuna nidhan)", artist: "SVC Worship", year: 2024, category: "D-H" },
  { id: 11, title: "जब से प्यारा यीशु आया (Jab se pyara Yeshu aaya)", artist: "SVC Worship", year: 2024, category: "I-M" },
  { id: 12, title: "जी उठा है मसीहा (Jee Utha hai masiha)", artist: "SVC Worship", year: 2024, category: "I-M" },
  { id: 13, title: "जीवन से भी उत्तम (Jeevan se bhi uttam)", artist: "SVC Worship", year: 2024, category: "I-M" },
  { id: 14, title: "मैं आता हूँ तेरे पास (Main aata hoon tere paas)", artist: "SVC Worship", year: 2024, category: "I-M" },
  { id: 15, title: "मेरा मन धो देना प्रभु (Mera Mann Dho Dena)", artist: "SVC Worship", year: 2024, category: "I-M" },
  { id: 16, title: "नीले आसमान के पार जायेंगे (Neele aasman ke)", artist: "SVC Worship", year: 2024, category: "N-R" },
  { id: 17, title: "पावन है वो प्रभु हमारा (Paavan hai wo prabhu)", artist: "SVC Worship", year: 2024, category: "N-R" },
  { id: 18, title: "प्रभु का आनन्द है (Prabhu ka aanand hai)", artist: "SVC Worship", year: 2024, category: "N-R" },
  { id: 19, title: "राजा यीशु के योद्धाओं (Raja Yeshu ke yoddhaon)", artist: "SVC Worship", year: 2024, category: "N-R" },
  { id: 20, title: "राजाओं का राजा है (Rajaon ka raja hai)", artist: "SVC Worship", year: 2024, category: "N-R" },
  { id: 21, title: "सारी सृष्टि के मालिक तुम ही हो (Saari srishti ke)", artist: "SVC Worship", year: 2024, category: "S-Z" },
  { id: 22, title: "सृष्टिकर्ता यीशु मेरे (Sristhikarta Yeshu mere)", artist: "SVC Worship", year: 2024, category: "S-Z" },
  { id: 23, title: "सिय्योन देश हमारा है देश (Siyyon desh hamara)", artist: "SVC Worship", year: 2024, category: "S-Z" },
  { id: 24, title: "वन्दना करूँ, तेरी वन्दना करूँ (Vandana karun)", artist: "SVC Worship", year: 2024, category: "S-Z" },
  { id: 25, title: "योग्य केवल तू (Yogya keval tu)", artist: "SVC Worship", year: 2024, category: "S-Z" },
  { id: 26, title: "स्वर्गदूतों के सुनो गीत (Swargduton ke suno geet)", artist: "SVC Worship", year: 2024, category: "Christmas" },
  { id: 27, title: "आया मसीह दुनिया में तू (Aaya Masih duniya mein)", artist: "SVC Worship", year: 2024, category: "Christmas" },
  { id: 28, title: "राजा यीशु आए है (Raja Yeshu aaye hai)", artist: "SVC Worship", year: 2024, category: "Christmas" },
  { id: 29, title: "गुनहगारों को देने सहारा (Gunahagaron ko dene)", artist: "SVC Worship", year: 2024, category: "Christmas" },
  { id: 30, title: "राजा यीशु आया (Raja Yeshu aaya)", artist: "SVC Worship", year: 2024, category: "Christmas" }
];

async function main() {
  console.log('Seeding database...');
  for (const song of songs) {
    await prisma.song.upsert({
      where: { id: song.id },
      update: {},
      create: {
        id: song.id,
        title: song.title,
        artist: song.artist,
        year: song.year,
        category: song.category,
        lyrics: song.lyrics || null,
      },
    })
  }
  console.log('Database seeded.');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
