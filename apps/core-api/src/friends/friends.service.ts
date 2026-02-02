import { Inject, Injectable, HttpStatus } from "@nestjs/common";
import { eq, and, or, desc, ilike } from "drizzle-orm";
import { DRIZZLE } from "../db/db.module";
import { friendships, users, readings } from "../db/schema";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { AppException } from "../common/app.exception";
import { ErrorCode } from "../common/error-codes";

@Injectable()
export class FriendsService {
  constructor(@Inject(DRIZZLE) private db: PostgresJsDatabase) {}

  async sendRequest(requesterId: string, addresseeId: string) {
    if (requesterId === addresseeId) {
      throw new AppException(ErrorCode.CANNOT_FRIEND_SELF, "Cannot send friend request to yourself");
    }

    const existing = await this.db
      .select()
      .from(friendships)
      .where(
        or(
          and(eq(friendships.requesterId, requesterId), eq(friendships.addresseeId, addresseeId)),
          and(eq(friendships.requesterId, addresseeId), eq(friendships.addresseeId, requesterId)),
        ),
      );

    if (existing.length > 0) {
      const f = existing[0];
      if (f.status === "accepted") throw new AppException(ErrorCode.ALREADY_FRIENDS, "Already friends");
      if (f.status === "pending") throw new AppException(ErrorCode.FRIEND_REQUEST_EXISTS, "Friend request already pending");
      if (f.status === "rejected") {
        const [updated] = await this.db
          .update(friendships)
          .set({ status: "pending", requesterId, addresseeId, updatedAt: new Date() })
          .where(eq(friendships.id, f.id))
          .returning();
        return updated;
      }
    }

    const [friendship] = await this.db
      .insert(friendships)
      .values({ requesterId, addresseeId })
      .returning();

    return friendship;
  }

  async acceptRequest(friendshipId: string, userId: string) {
    const [friendship] = await this.db
      .select()
      .from(friendships)
      .where(and(eq(friendships.id, friendshipId), eq(friendships.addresseeId, userId)));

    if (!friendship) throw new AppException(ErrorCode.FRIEND_REQUEST_NOT_FOUND, "Friend request not found", HttpStatus.NOT_FOUND);
    if (friendship.status !== "pending") throw new AppException(ErrorCode.REQUEST_NOT_PENDING, "Request is not pending");

    const [updated] = await this.db
      .update(friendships)
      .set({ status: "accepted", updatedAt: new Date() })
      .where(eq(friendships.id, friendshipId))
      .returning();

    return updated;
  }

  async rejectRequest(friendshipId: string, userId: string) {
    const [friendship] = await this.db
      .select()
      .from(friendships)
      .where(and(eq(friendships.id, friendshipId), eq(friendships.addresseeId, userId)));

    if (!friendship) throw new AppException(ErrorCode.FRIEND_REQUEST_NOT_FOUND, "Friend request not found", HttpStatus.NOT_FOUND);
    if (friendship.status !== "pending") throw new AppException(ErrorCode.REQUEST_NOT_PENDING, "Request is not pending");

    const [updated] = await this.db
      .update(friendships)
      .set({ status: "rejected", updatedAt: new Date() })
      .where(eq(friendships.id, friendshipId))
      .returning();

    return updated;
  }

  async removeFriend(friendshipId: string, userId: string) {
    const [friendship] = await this.db
      .select()
      .from(friendships)
      .where(
        and(
          eq(friendships.id, friendshipId),
          or(eq(friendships.requesterId, userId), eq(friendships.addresseeId, userId)),
        ),
      );

    if (!friendship) throw new AppException(ErrorCode.FRIENDSHIP_NOT_FOUND, "Friendship not found", HttpStatus.NOT_FOUND);

    await this.db.delete(friendships).where(eq(friendships.id, friendshipId));
    return { deleted: true };
  }

  async listFriends(userId: string) {
    const rows = await this.db
      .select()
      .from(friendships)
      .where(
        and(
          eq(friendships.status, "accepted"),
          or(eq(friendships.requesterId, userId), eq(friendships.addresseeId, userId)),
        ),
      );

    const friendIds = rows.map((r) =>
      r.requesterId === userId ? r.addresseeId : r.requesterId,
    );

    if (friendIds.length === 0) return [];

    const friendUsers = await Promise.all(
      friendIds.map(async (fId, i) => {
        const [user] = await this.db
          .select({ id: users.id, name: users.name, email: users.email, avatarUrl: users.avatarUrl })
          .from(users)
          .where(eq(users.id, fId));
        return user ? { ...user, friendshipId: rows[i].id } : null;
      }),
    );

    return friendUsers.filter(Boolean);
  }

  async listPendingRequests(userId: string) {
    const rows = await this.db
      .select()
      .from(friendships)
      .where(and(eq(friendships.addresseeId, userId), eq(friendships.status, "pending")))
      .orderBy(desc(friendships.createdAt));

    const enriched = await Promise.all(
      rows.map(async (r) => {
        const [user] = await this.db
          .select({ id: users.id, name: users.name, email: users.email, avatarUrl: users.avatarUrl })
          .from(users)
          .where(eq(users.id, r.requesterId));
        return { ...r, requester: user || null };
      }),
    );

    return enriched;
  }

  async getFriendReadings(friendshipId: string, userId: string) {
    const [friendship] = await this.db
      .select()
      .from(friendships)
      .where(
        and(
          eq(friendships.id, friendshipId),
          eq(friendships.status, "accepted"),
          or(eq(friendships.requesterId, userId), eq(friendships.addresseeId, userId)),
        ),
      );

    if (!friendship) throw new AppException(ErrorCode.FRIENDSHIP_NOT_FOUND, "Friendship not found or not accepted", HttpStatus.NOT_FOUND);

    const friendId = friendship.requesterId === userId ? friendship.addresseeId : friendship.requesterId;

    const publicReadings = await this.db
      .select()
      .from(readings)
      .where(and(eq(readings.userId, friendId), eq(readings.isPublic, true)))
      .orderBy(desc(readings.createdAt));

    return publicReadings;
  }

  async searchUsers(query: string, currentUserId: string) {
    const results = await this.db
      .select({ id: users.id, name: users.name, email: users.email, avatarUrl: users.avatarUrl })
      .from(users)
      .where(and(ilike(users.name, `%${query}%`)))
      .limit(20);

    return results.filter((u) => u.id !== currentUserId);
  }
}
