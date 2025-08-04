export interface SongData {
  name: string;
  author: string;
  coverUrl: string;
}

export type Message =
  | {
      type: "SONG";
      data: SongData;
    }
  | {
      type: "DISCONNECT";
    };
