export interface SongHistory {
  id: number;
  sungAt: string;
}

export interface Song {
  id: number;
  title: string;
  artist: string;
  year: number;
  category: string;
  lyrics: string | null;
  sungCount: number;
  audioUrl: string | null;
  history?: SongHistory[];
}
