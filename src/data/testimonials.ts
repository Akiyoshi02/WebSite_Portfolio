export interface Testimonial {
  text: string;
  name: string;
  title: string;
  company: string;
  /** 1–2 character monogram shown in the avatar circle */
  initials: string;
}

export const testimonials: readonly Testimonial[] = [
  {
    text: "CleanOps Pro was for one of our client. Scheduling, attendance, proof, and invoicing in one app instead of spreadsheets everywhere. The team got how cleaners work on site and kept us in the loop without the usual back-and-forth.",
    name: "Dylan Rodrigo",
    title: "Operations Manager",
    company: "Cynectex (Pvt) Ltd",
    initials: "DR",
  },
];
