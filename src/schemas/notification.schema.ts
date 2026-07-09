import { z } from "../lib/zod.js";

export const notificationIdSchema = z.object({
    params: z.object({
        id: z
            .string({ message: "Notification ID is required" })
            .or(z.number().transform(Number)),
    }),
});
