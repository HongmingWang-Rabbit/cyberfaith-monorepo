import "reflect-metadata";
import { describe, it, expect } from "vitest";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { CreateReadingDto, ReadingType } from "../../readings/dto/create-reading.dto";
import { TogglePublicDto } from "../../readings/dto/toggle-public.dto";
import { ReactDto } from "../../readings/dto/react.dto";
import { FeedQueryDto } from "../../readings/dto/feed-query.dto";
import { SendFriendRequestDto } from "../../friends/dto/friend-request.dto";
import { PlayGameDto } from "../../arcade/dto/play.dto";
import { TapDto } from "../../arcade/muyu/dto/tap.dto";
import { PaginationDto } from "../dto/pagination.dto";
import { AdminUsersQueryDto, UpdateUserDto } from "../../admin/dto/admin-query.dto";

async function expectValid(dto: object) {
  const errors = await validate(dto);
  expect(errors).toHaveLength(0);
}

async function expectInvalid(dto: object, minErrors = 1) {
  const errors = await validate(dto);
  expect(errors.length).toBeGreaterThanOrEqual(minErrors);
  return errors;
}

describe("CreateReadingDto", () => {
  it("accepts valid reading", async () => {
    const dto = plainToInstance(CreateReadingDto, { type: "tarot", locale: "en" });
    await expectValid(dto);
  });

  it("rejects invalid type", async () => {
    const dto = plainToInstance(CreateReadingDto, { type: "invalid" });
    await expectInvalid(dto);
  });

  it("rejects missing type", async () => {
    const dto = plainToInstance(CreateReadingDto, {});
    await expectInvalid(dto);
  });

  it("rejects too-long locale", async () => {
    const dto = plainToInstance(CreateReadingDto, { type: "tarot", locale: "a".repeat(20) });
    await expectInvalid(dto);
  });
});

describe("TogglePublicDto", () => {
  it("accepts boolean", async () => {
    const dto = plainToInstance(TogglePublicDto, { isPublic: true });
    await expectValid(dto);
  });

  it("rejects non-boolean", async () => {
    const dto = plainToInstance(TogglePublicDto, { isPublic: "yes" });
    await expectInvalid(dto);
  });
});

describe("ReactDto", () => {
  it("accepts valid emoji", async () => {
    const dto = plainToInstance(ReactDto, { emoji: "👍" });
    await expectValid(dto);
  });

  it("rejects invalid emoji", async () => {
    const dto = plainToInstance(ReactDto, { emoji: "🚀" });
    await expectInvalid(dto);
  });
});

describe("SendFriendRequestDto", () => {
  it("accepts valid UUID", async () => {
    const dto = plainToInstance(SendFriendRequestDto, { addresseeId: "550e8400-e29b-41d4-a716-446655440000" });
    await expectValid(dto);
  });

  it("rejects non-UUID", async () => {
    const dto = plainToInstance(SendFriendRequestDto, { addresseeId: "not-a-uuid" });
    await expectInvalid(dto);
  });

  it("rejects missing addresseeId", async () => {
    const dto = plainToInstance(SendFriendRequestDto, {});
    await expectInvalid(dto);
  });
});

describe("PlayGameDto", () => {
  it("accepts valid game slug", async () => {
    const dto = plainToInstance(PlayGameDto, { gameSlug: "karma-slots" });
    await expectValid(dto);
  });

  it("rejects too-long slug", async () => {
    const dto = plainToInstance(PlayGameDto, { gameSlug: "a".repeat(51) });
    await expectInvalid(dto);
  });

  it("rejects missing gameSlug", async () => {
    const dto = plainToInstance(PlayGameDto, {});
    await expectInvalid(dto);
  });
});

describe("TapDto", () => {
  it("accepts valid tap count", async () => {
    const dto = plainToInstance(TapDto, { tapCount: 5 });
    await expectValid(dto);
  });

  it("rejects tap count > 100", async () => {
    const dto = plainToInstance(TapDto, { tapCount: 101 });
    await expectInvalid(dto);
  });

  it("rejects tap count < 1", async () => {
    const dto = plainToInstance(TapDto, { tapCount: 0 });
    await expectInvalid(dto);
  });
});

describe("PaginationDto", () => {
  it("accepts valid pagination", async () => {
    const dto = plainToInstance(PaginationDto, { page: 1, limit: 50 });
    await expectValid(dto);
  });

  it("rejects limit > 100", async () => {
    const dto = plainToInstance(PaginationDto, { page: 1, limit: 101 });
    await expectInvalid(dto);
  });

  it("rejects page < 1", async () => {
    const dto = plainToInstance(PaginationDto, { page: 0 });
    await expectInvalid(dto);
  });
});

describe("UpdateUserDto", () => {
  it("accepts valid role", async () => {
    const dto = plainToInstance(UpdateUserDto, { role: "admin" });
    await expectValid(dto);
  });

  it("rejects invalid role", async () => {
    const dto = plainToInstance(UpdateUserDto, { role: "superadmin" });
    await expectInvalid(dto);
  });

  it("accepts valid subscription tier", async () => {
    const dto = plainToInstance(UpdateUserDto, { subscriptionTier: "pro" });
    await expectValid(dto);
  });

  it("rejects invalid tier", async () => {
    const dto = plainToInstance(UpdateUserDto, { subscriptionTier: "enterprise" });
    await expectInvalid(dto);
  });
});
