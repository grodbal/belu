export const mockClientData = {
  firstName: "Valentina",
  lastName: "Ramos",
  email: "valentina.ramos@gmail.com",
  phone: "+51 987 654 321",
  location: "Lima, Miraflores",
  profileInitials: "VR",
};

export const mockNextAppointment = {
  id: "apt-001",
  service: "Lashes Lift + Tint",
  beluer: "Alejandra Ruiz",
  date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
  time: "3:30 PM",
  duration: "45 min",
  location: "Calle Larco 234, Miraflores",
  status: "confirmed",
  price: 89.90,
  beluerInitials: "AR",
};

export const mockServices = [
  { id: "s1", name: "Lashes Lift + Tint", category: "Lashes", price: 89.90, duration: "45 min", description: "Levantamiento y tinte profesional" },
  { id: "s2", name: "Lashes Extensions", category: "Lashes", price: 129.90, duration: "2 hrs", description: "Extensiones clásicas premium" },
  { id: "s3", name: "Nails Gel", category: "Nails", price: 59.90, duration: "1 hr", description: "Esmalte gel duradero" },
  { id: "s4", name: "Nails French", category: "Nails", price: 69.90, duration: "1.5 hrs", description: "French manicure elegante" },
  { id: "s5", name: "Lashes Design", category: "Lashes", price: 149.90, duration: "1.5 hrs", description: "Diseño personalizado" },
  { id: "s6", name: "Nails Art", category: "Nails", price: 79.90, duration: "2 hrs", description: "Nail art personalizado" },
  { id: "s7", name: "Lashes Care", category: "Lashes", price: 49.90, duration: "30 min", description: "Tratamiento de cuidado" },
  { id: "s8", name: "Nails Spa", category: "Nails", price: 89.90, duration: "1.5 hrs", description: "Spa de manos completo" },
];

export const mockBeluers = [
  { id: "b1", name: "Alejandra Ruiz", specialties: ["Lashes", "Nails"], rating: 4.9, reviews: 287, initials: "AR" },
  { id: "b2", name: "Sofia Martinez", specialties: ["Lashes"], rating: 4.8, reviews: 156, initials: "SM" },
  { id: "b3", name: "Camila Torres", specialties: ["Nails"], rating: 4.7, reviews: 203, initials: "CT" },
  { id: "b4", name: "Isabella Soto", specialties: ["Lashes", "Nails"], rating: 4.9, reviews: 312, initials: "IS" },
  { id: "b5", name: "Valentina Cruz", specialties: ["Nails"], rating: 4.6, reviews: 89, initials: "VC" },
];

export const mockAppointmentHistory = [
  { id: "apt-h1", service: "Nails Gel", beluer: "Camila Torres", date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), price: 59.90, status: "completed" },
  { id: "apt-h2", service: "Lashes Extensions", beluer: "Alejandra Ruiz", date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), price: 129.90, status: "completed" },
];

export const mockPayments = [
  { id: "p1", service: "Lashes Lift + Tint", amount: 89.90, date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), status: "paid" },
  { id: "p2", service: "Nails Gel", amount: 59.90, date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), status: "paid" },
];

export const mockStats = {
  totalBookings: 12,
  favorites: 3,
};
