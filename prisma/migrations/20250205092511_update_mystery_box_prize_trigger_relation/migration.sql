-- Step 1: Add the new value to the enum type
ALTER TYPE "EBoxTriggerType" ADD VALUE 'CombinedTriggers';

-- Step 2: Add the new column
ALTER TABLE "MysteryBoxPrize" ADD COLUMN "mysteryBoxTriggerId" UUID;

-- Step 3: Populate the new column with the appropriate values for the initial query
UPDATE "MysteryBoxPrize"
SET "mysteryBoxTriggerId" = subquery."id"
FROM (
    SELECT "MysteryBoxPrize"."id" AS "prizeId", "MysteryBoxTrigger"."id" AS "id"
    FROM "MysteryBoxTrigger"
    JOIN "MysteryBox" ON "MysteryBox".id = "MysteryBoxTrigger"."mysteryBoxId"
    JOIN "MysteryBoxPrize" ON "MysteryBox".id = "MysteryBoxPrize"."mysteryBoxId"
    WHERE "MysteryBoxTrigger"."triggerType" IN ('TutorialCompleted', 'ChompmasStreakAttained')
) AS subquery
WHERE "MysteryBoxPrize"."id" = subquery."prizeId";

-- Step 4: Select the triggers for 'ClaimAllCompleted' and 'RevealAllCompleted'
WITH new_triggers AS (
SELECT DISTINCT ON ("MysteryBoxTrigger"."mysteryBoxId") 
    "MysteryBoxTrigger"."id" AS "triggerId", 
    "MysteryBoxTrigger"."mysteryBoxId" AS "mysteryBoxId"
FROM "MysteryBoxTrigger"
JOIN "MysteryBox" ON "MysteryBox".id = "MysteryBoxTrigger"."mysteryBoxId"
WHERE "MysteryBoxTrigger"."triggerType" IN ('ClaimAllCompleted', 'RevealAllCompleted')
ORDER BY "MysteryBoxTrigger"."mysteryBoxId", "MysteryBoxTrigger"."id";
)

-- Insert new triggers with 'CombinedTriggers' for each distinct mysteryBoxId
inserted_triggers AS (
    INSERT INTO "MysteryBoxTrigger" ("id", "mysteryBoxId", "triggerType")
    SELECT gen_random_uuid(), "mysteryBoxId", 'CombinedTriggers'
    FROM new_triggers
    RETURNING "id", "mysteryBoxId"
)
-- Update the new column in MysteryBoxPrize with the new trigger id
UPDATE "MysteryBoxPrize"
SET "mysteryBoxTriggerId" = inserted_triggers."id"
FROM inserted_triggers
WHERE "MysteryBoxPrize"."mysteryBoxId" = inserted_triggers."mysteryBoxId";

-- Step 5: Add the foreign key constraint for the new column
ALTER TABLE "MysteryBoxPrize" ADD CONSTRAINT "MysteryBoxPrize_mysteryBoxTriggerId_fkey" FOREIGN KEY ("mysteryBoxTriggerId") REFERENCES "MysteryBoxTrigger"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 6: Drop the old foreign key constraint and the old column
ALTER TABLE "MysteryBoxPrize" DROP CONSTRAINT "MysteryBoxPrize_mysteryBoxId_fkey";
ALTER TABLE "MysteryBoxPrize" DROP COLUMN "mysteryBoxId";