import jersey from "@/assets/shop/football-jersey.webp";
import court from "@/assets/shop/product-court.webp";
import tracksuit from "@/assets/shop/product-tracksuit.webp";
import polo from "@/assets/shop/product-polo.webp";
import back from "@/assets/shop/jersey-back.jpg";
import fabric from "@/assets/shop/fabric-detail.jpg";
import basketball from "@/assets/shop/basketball.webp";
import training from "@/assets/shop/training.webp";
import corporate from "@/assets/shop/corporate.webp";
import away from "@/assets/shop/product-away.webp";
import shooting from "@/assets/shop/product-shooting.webp";
import drill from "@/assets/shop/product-drill.webp";
import bomber from "@/assets/shop/product-bomber.webp";

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
  { name: "Away match kit", category: "Football", sport: "Football", description: "A crisp white and gold away jersey with navy shorts.", images: [{ src: away, label: "Kit" }, { src: fabric, label: "Fabric idea" }], details: ["White jersey with gold trim", "Navy shorts", "Your crest, names and numbers"] },
  { name: "Court edition", category: "Basketball", sport: "Basketball", description: "A matching vest and shorts set with a bold team look.", images: [{ src: court, label: "Kit" }, { src: basketball, label: "On court" }], details: ["Matching vest and shorts", "Your colours and crest", "Player names and numbers"] },
  { name: "Shooting shirt & warm-up vest", category: "Basketball", sport: "Basketball", description: "A light shooting shirt and vest for warm-ups before the game.", images: [{ src: shooting, label: "Set" }], details: ["Short-sleeve shooting shirt", "Mesh warm-up vest and shorts", "Your colours and crest"] },
  { name: "Off-duty tracksuit", category: "Training", description: "A coordinated look for warm-ups, travel and team days.", images: [{ src: tracksuit, label: "Set" }, { src: training, label: "Team look" }], details: ["Jacket and jogger set", "Choose team colours", "Add your team logo"] },
  { name: "Drill top & shorts", category: "Training", description: "A quarter-zip top and shorts for hard training days.", images: [{ src: drill, label: "Set" }], details: ["Quarter-zip training top", "Matching performance shorts", "Add your team logo"] },
  { name: "Clubhouse essentials", category: "Corporate", sport: "Corporate", description: "Polos and hoodies that bring your staff together.", images: [{ src: polo, label: "Collection" }, { src: corporate, label: "Worn together" }], details: ["Polo and hoodie options", "Your company logo", "For staff and event teams"] },
  { name: "Team bomber & polo", category: "Corporate", sport: "Corporate", description: "A smart padded jacket and tipped polo for your staff.", images: [{ src: bomber, label: "Set" }], details: ["Padded bomber jacket", "Tipped polo shirt", "Your company logo"] },
];