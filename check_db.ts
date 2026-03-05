import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDb() {
    const count = await prisma.video.count();
    console.log(`Video count: ${count}`);

    if (count > 0) {
        const vids = await prisma.video.findMany({ take: 3 });
        console.log("Sample videos:");
        vids.forEach(v => console.log(`- ${v.title} (Summary: ${!!v.summary})`));
    }
}

checkDb()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
