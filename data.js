export const courses = [
  { code: "CS101", title: "Intro to Programming" },
  { code: "CS205", title: "Data Structures" },
  { code: "IT210", title: "Networks" },
  { code: "BUS150", title: "Principles of Management" },
];

export const registrations = new Map(); // id -> record
export let nextId = 1;
export const newId = () => String(nextId++);
