import jersey from "@/assets/shop/football-jersey.webp";
import court from "@/assets/shop/product-court.webp";
import tracksuit from "@/assets/shop/product-tracksuit.webp";
import polo from "@/assets/shop/product-polo.webp";
import back from "@/assets/shop/jersey-back.jpg";
import fabric from "@/assets/shop/fabric-detail.jpg";
import basketball from "@/assets/shop/basketball.webp";
import training from "@/assets/shop/training.webp";
import corporate from "@/assets/shop/corporate.webp";

export type KitSport = "Football" | "Basketball" | "Corporate";
export type Collection = "All" | "Football" | "Basketball" | "Training" | "Corporate";
export type KitConcept = {
  name: string;
  category: Exclude<Collection, "All">;
  description: string;
  sport?: KitSport;
  images: { src: string; label: string }[];
  details: string[];
};
export const collections: Collection[] = ["All", "Football", "Basketball", "Training", "Corporate"];
export const kitConcepts: KitConcept[] = [
  { name: "Signature match jersey", category: "Football", sport: "Football", description: "Make match day your own with a jersey in your club colours.", images: [{ src: jersey, label: "Front" }, { src: back, label: "Name & number idea" }, { src: fabric, label: "Fabric idea" }], details: ["Choose your team colours", "Add your club crest", "Add player names and numbers"] },
  { name: "Court edition", category: "Basketball", sport: "Basketball", description: "A matching vest and shorts set with a bold team look.", images: [{ src: court, label: "Kit" }, { src: basketball, label: "On court" }], details: ["Matching vest and shorts", "Your colours and crest", "Player names and numbers"] },
  { name: "Off-duty tracksuit", category: "Training", description: "A coordinated look for warm-ups, travel and team days.", images: [{ src: tracksuit, label: "Set" }, { src: training, label: "Team look" }], details: ["Jacket and jogger set", "Choose team colours", "Add your team logo"] },
  { name: "Clubhouse essentials", category: "Corporate", sport: "Corporate", description: "Polos and hoodies that bring your staff together.", images: [{ src: polo, label: "Collection" }, { src: corporate, label: "Worn together" }], details: ["Polo and hoodie options", "Your company logo", "For staff and event teams"] },
];