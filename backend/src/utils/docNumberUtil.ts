/**
 * Utility untuk mengenerate nomor dokumen secara otomatis.
 * Format: [PREFIX]-YYYYMMDD-[NNN]
 * Contoh: PO-20260831-001
 */
export async function generateDocNumber(prisma: any, prefix: string, modelName: string, fieldName: string = 'nomor'): Promise<string> {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
  const baseNumber = `${prefix}-${dateStr}-`;

  // Define the dynamic query type
  const model = (prisma as any)[modelName];

  if (!model) {
    throw new Error(`Model ${modelName} not found in Prisma.`);
  }

  // Get the latest document for the day
  const latestDoc = await model.findFirst({
    where: {
      [fieldName]: {
        startsWith: baseNumber,
      },
    },
    orderBy: {
      [fieldName]: 'desc',
    },
  });

  if (!latestDoc) {
    return `${baseNumber}001`;
  }

  const latestNumberStr = latestDoc[fieldName].replace(baseNumber, '');
  const nextNumber = parseInt(latestNumberStr, 10) + 1;
  const paddedNextNumber = nextNumber.toString().padStart(3, '0');

  return `${baseNumber}${paddedNextNumber}`;
}
