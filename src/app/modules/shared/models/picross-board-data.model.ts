export interface PicrossBoardData {
  rows: PicrossRowData[];
}

export interface PicrossRowData {
  cells: PicrossCellData[];
}

export interface PicrossCellData {
    color: string;
    enabled: boolean;
    pushed: boolean;
}