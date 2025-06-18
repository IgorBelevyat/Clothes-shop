-- AlterTable
ALTER TABLE "Attribute" ADD COLUMN     "dependsOn" INTEGER;

-- AddForeignKey
ALTER TABLE "Attribute" ADD CONSTRAINT "Attribute_dependsOn_fkey" FOREIGN KEY ("dependsOn") REFERENCES "Attribute"("id") ON DELETE SET NULL ON UPDATE CASCADE;
