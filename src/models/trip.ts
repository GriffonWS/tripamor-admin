import mongoose, { Schema, model, models } from 'mongoose';

export interface TripDoc {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  destination: string;
  coverImage?: string;
  startDate: Date;
  endDate: Date;
  travelers: number;
  status: 'planning' | 'upcoming' | 'ongoing' | 'completed';
  days: Array<{
    dayNumber: number;
    date?: Date;
    activities: Array<{
      title: string;
      time?: string;
      location?: string;
      source: 'manual' | 'ai' | 'imported';
    }>;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

// Mirror of tripamor_backend trip.model.js (only the fields the admin reads).
const tripSchema = new Schema<TripDoc>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    destination: { type: String, required: true },
    coverImage: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    travelers: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ['planning', 'upcoming', 'ongoing', 'completed'],
      default: 'planning',
    },
    days: [
      {
        dayNumber: { type: Number, required: true },
        date: { type: Date },
        activities: [
          {
            title: { type: String, required: true },
            time: { type: String },
            location: { type: String },
            source: {
              type: String,
              enum: ['manual', 'ai', 'imported'],
              default: 'manual',
            },
          },
        ],
      },
    ],
  },
  { timestamps: true, collection: 'trips', strict: false },
);

export const Trip =
  (models.Trip as mongoose.Model<TripDoc>) || model<TripDoc>('Trip', tripSchema);
