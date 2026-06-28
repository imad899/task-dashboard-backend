import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["todo", "in-progress", "done"],
      default: "todo",
    },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

// Expose `id` (string) and drop Mongo's internal fields from JSON responses,
// so the frontend keeps receiving the same shape it already expects.
taskSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

const Task = mongoose.model("Task", taskSchema);
export default Task;