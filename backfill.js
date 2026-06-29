// run once with: node --env-file=.env backfill.js
import mongoose from "mongoose";
import Task from "./models/Task.js";

await mongoose.connect(process.env.MONGODB_URI);
const result = await Task.updateMany(
  { priority: { $exists: false } },
  { $set: { priority: "medium" } }
);
console.log(`Updated ${result.modifiedCount} tasks`);
await mongoose.disconnect();
