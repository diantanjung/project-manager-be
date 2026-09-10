import { z } from "../lib/zod.js";

export const notificationIdSchema = z.object({
    params: z.object({
        id: z.uuid({ message: "Notification ID is required" }),
    }),
});
