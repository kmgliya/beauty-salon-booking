export type Service = {
  id: string;
  name: string;
  category:
    | "прически"
    | "маникюр"
    | "педикюр"
    | "макияж"
    | "окрашивание";
  variant: string;
  durationMinutes: number;
  price: number;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
};
