import { auth } from "./auth";
import { query } from "./_generated/server";

export const current = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    // const identity = await ctx.auth.getUserIdentity();

    if (userId === null) {
      return null;
    }

    return await ctx.db.get(userId);
  },
});
