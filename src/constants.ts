export const COLS = 10;
export const ROWS = 20;
export const INITIAL_DROP_TIME = 800;
export const MIN_DROP_TIME = 100;
export const SPEED_INCREMENT = 0.9; // Multiply drop time by this each level

export type Shape = (number | string)[][];

export interface Tetromino {
  shape: Shape;
  color: string;
}

export const TETROMINOS: Record<string, Tetromino> = {
  0: { shape: [[0]], color: "transparent" },
  I: {
    shape: [
      [0, "I", 0, 0],
      [0, "I", 0, 0],
      [0, "I", 0, 0],
      [0, "I", 0, 0],
    ],
    color: "#00B2FF", // Electric Blue
  },
  J: {
    shape: [
      [0, "J", 0],
      [0, "J", 0],
      ["J", "J", 0],
    ],
    color: "#2D5BFF", // Deep Sky Blue
  },
  L: {
    shape: [
      [0, "L", 0],
      [0, "L", 0],
      [0, "L", "L"],
    ],
    color: "#FFB800", // Electric Orange
  },
  O: {
    shape: [
      ["O", "O"],
      ["O", "O"],
    ],
    color: "#F1FF5D", // Cyber Yellow
  },
  S: {
    shape: [
      [0, "S", "S"],
      ["S", "S", 0],
      [0, 0, 0],
    ],
    color: "#39FF14", // Toxic Green
  },
  T: {
    shape: [
      [0, 0, 0],
      ["T", "T", "T"],
      [0, "T", 0],
    ],
    color: "#BD00FF", // Neon Purple
  },
  Z: {
    shape: [
      ["Z", "Z", 0],
      [0, "Z", "Z"],
      [0, 0, 0],
    ],
    color: "#FF2E2E", // Electric Red
  },
};

export const randomTetromino = () => {
  const keys = "IJLOSTZ";
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return TETROMINOS[randomKey];
};
