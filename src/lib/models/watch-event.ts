import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const watchEventSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userSlug: { type: String, required: true },
    displayName: { type: String, required: true },

    tmdbId: { type: Number, required: true },
    mediaType: { type: String, enum: ["movie", "tv"], required: true },
    title: { type: String, required: true },
    posterPath: { type: String, default: null },
    backdropPath: { type: String, default: null },

    seasonNumber: { type: Number, default: null },
    episodeNumber: { type: Number, default: null },
    episodeTitle: { type: String, default: null },

    progressSeconds: { type: Number, default: 0 },
    durationSeconds: { type: Number, default: null },
    completed: { type: Boolean, default: false },

    watchedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "watch_events",
  },
);

watchEventSchema.index({ watchedAt: -1 });
watchEventSchema.index({ userId: 1, watchedAt: -1 });
watchEventSchema.index({ tmdbId: 1, mediaType: 1, watchedAt: -1 });
watchEventSchema.index({ userSlug: 1, tmdbId: 1, mediaType: 1 });

export type IWatchEvent = InferSchemaType<typeof watchEventSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const WatchEvent: Model<IWatchEvent> =
  mongoose.models.WatchEvent ??
  mongoose.model<IWatchEvent>("WatchEvent", watchEventSchema);
