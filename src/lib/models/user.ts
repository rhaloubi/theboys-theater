import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const userSchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    displayName: { type: String, required: true, trim: true },
    avatarColor: { type: String, default: "#e50914" },
    imdbImportUpdatedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    collection: "users",
  },
);

userSchema.index({ slug: 1 }, { unique: true });

export type IUser = InferSchemaType<typeof userSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", userSchema);
