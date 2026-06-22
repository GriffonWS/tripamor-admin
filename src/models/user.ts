import mongoose, { Schema, model, models } from 'mongoose';

export interface UserDoc {
  _id: mongoose.Types.ObjectId;
  email: string;
  name?: string;
  avatar?: string;
  googleId?: string;
  appleId?: string;
  authMethods: string[];
  isEmailVerified: boolean;
  isPaid: boolean;
  subscriptionPlatform?: 'ios' | 'android' | null;
  subscriptionProductId?: string | null;
  subscriptionExpiresAt?: Date | null;
  subscriptionStartedAt?: Date | null;
  aiChatCount: number;
  aiChatCountResetAt: Date;
  lastAiChatAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDoc>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, trim: true },
    avatar: { type: String },
    googleId: { type: String, sparse: true, index: true },
    appleId: { type: String, sparse: true, index: true },
    authMethods: [{ type: String, enum: ['email', 'google', 'apple'] }],
    isEmailVerified: { type: Boolean, default: false },
    isPaid: { type: Boolean, default: false },
    subscriptionPlatform: {
      type: String,
      enum: ['ios', 'android', null],
      default: null,
    },
    subscriptionProductId: { type: String, default: null },
    subscriptionExpiresAt: { type: Date, default: null },
    subscriptionStartedAt: { type: Date, default: null },
    aiChatCount: { type: Number, default: 0 },
    aiChatCountResetAt: { type: Date, default: () => new Date() },
    lastAiChatAt: { type: Date, default: null },
  },
  { timestamps: true, collection: 'users' },
);

export const User =
  (models.User as mongoose.Model<UserDoc>) || model<UserDoc>('User', userSchema);
