import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";
import { defineTable, defineSchema } from "convex/server";

const schema = defineSchema({
  ...authTables,
  workspaces: defineTable({
    name: v.string(),
    userId: v.id("users"),
    joinCode: v.string(),
  }),
});

export default schema;
