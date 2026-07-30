import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const watchlistSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userSlug: { type: String, required: true },

    tmdbId: { type: Number, required: true },
    mediaType: { type: String, enum: ["movie", "tv"], required: true },
    title: { type: String, required: true },
    posterPath: { type: String, default: null },

    source: {
      type: String,
      enum: ["manual", "imdb_import"],
      default: "manual",
    },
    notes: { type: String, default: null },
    addedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
    collection: "watchlists",
  },
);

watchlistSchema.index(
  { userId: 1, tmdbId: 1, mediaType: 1 },
  { unique: true },
);
watchlistSchema.index({ userId: 1, addedAt: -1 });

export type IWatchlist = InferSchemaType<typeof watchlistSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Watchlist: Model<IWatchlist> =
  mongoose.models.Watchlist ??
  mongoose.model<IWatchlist>("Watchlist", watchlistSchema);
