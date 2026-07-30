import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const imdbRatingSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userSlug: { type: String, required: true },

    imdbId: { type: String, required: true },
    tmdbId: { type: Number, default: null },
    mediaType: { type: String, enum: ["movie", "tv", null], default: null },

    title: { type: String, required: true },
    year: { type: Number, default: null },
    rating: { type: Number, required: true, min: 1, max: 10 },
    ratedAt: { type: Date, default: null },

    importedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
    collection: "imdb_ratings",
  },
);

imdbRatingSchema.index({ userId: 1, imdbId: 1 }, { unique: true });
imdbRatingSchema.index({ userId: 1, rating: -1 });
imdbRatingSchema.index({ tmdbId: 1 });

export type IImdbRating = InferSchemaType<typeof imdbRatingSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const ImdbRating: Model<IImdbRating> =
  mongoose.models.ImdbRating ??
  mongoose.model<IImdbRating>("ImdbRating", imdbRatingSchema);
