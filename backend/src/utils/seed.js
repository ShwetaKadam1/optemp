import "dotenv/config";
import { connectDB } from "../config/db.js";
import Department from "../models/Department.js";

const DEPARTMENTS = ["HR", "Engineering", "Sales", "Marketing", "Finance", "Operations", "Support"];

const main = async () => {
  await connectDB();
  for (const name of DEPARTMENTS) {
    await Department.updateOne({ name }, { name }, { upsert: true });
  }
  console.log("✅ Seeded departments");
  process.exit(0);
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
