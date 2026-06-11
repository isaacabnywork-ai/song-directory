export interface Song {
  id: number;
  title: string;
  artist: string;
  year: number;
  category: string;
  lyrics: string | null;
  sungCount: number;
  audioUrl: string | null;
}
