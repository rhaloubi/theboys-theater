import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const sessionSchema = new Schema(
  {
    tokenHash: { type: String, required: true, unique: true },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    expiresAt: { type: Date, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "sessions",
  },
);

sessionSchema.index({ tokenHash: 1 }, { unique: true });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type ISession = InferSchemaType<typeof sessionSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Session: Model<ISession> =
  mongoose.models.Session ??
  mongoose.model<ISession>("Session", sessionSchema);
