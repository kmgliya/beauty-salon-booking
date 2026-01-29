export type WorkingHours = {
  day: number;
  start: string;
  end: string;
};

export type Specialist = {
  id: string;
  name: string;
  specialization: string;
  level: "top" | "regular";
  priceMultiplier: number;
  workingHours: WorkingHours[];
  serviceIds: string[];
};
