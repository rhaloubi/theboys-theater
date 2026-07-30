import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const titleStatSchema = new Schema(
  {
    tmdbId: { type: Number, required: true },
    mediaType: { type: String, enum: ["movie", "tv"], required: true },
    title: { type: String, required: true },
    posterPath: { type: String, default: null },

    totalWatchCount: { type: Number, default: 0 },
    watchCountByUser: { type: Map, of: Number, default: {} },
    lastWatchedAt: { type: Date, required: true },
    lastWatchedBy: { type: String, required: true },
    uniqueViewers: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    collection: "title_stats",
  },
);

titleStatSchema.index({ tmdbId: 1, mediaType: 1 }, { unique: true });
titleStatSchema.index({ totalWatchCount: -1 });
titleStatSchema.index({ lastWatchedAt: -1 });

export type ITitleStat = InferSchemaType<typeof titleStatSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const TitleStat: Model<ITitleStat> =
  mongoose.models.TitleStat ??
  mongoose.model<ITitleStat>("TitleStat", titleStatSchema);
