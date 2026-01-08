
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const { compare, hash } = bcrypt;

const prisma = new PrismaClient();

async function testLogin() {
    console.log("🔍 Starting Login Diagnostic...");

    try {
        const username = 'jack';
        const password = 'duffy';

        console.log(`Checking user: ${username}`);
        const user = await prisma.user.findUnique({ where: { username } });

        if (!user) {
            console.error("❌ User 'jack' NOT FOUND in database!");
            return;
        }

        console.log("✅ User found.");
        console.log(`Stored Hash: ${user.password.substring(0, 10)}...`);

        console.log("Testing password 'duffy'...");
        const isValid = await compare(password, user.password);

        if (isValid) {
            console.log("✅ Password MATCHES! Login should work.");
        } else {
            console.error("❌ Password DOES NOT MATCH hash.");

            // Debug: Let's see what a new hash looks like
            const newHash = await hash(password, 10);
            console.log(`Expected hash format (approx): ${newHash.substring(0, 10)}...`);
        }

    } catch (error) {
        console.error("💥 Error during diagnostic:", error);
    } finally {
        await prisma.$disconnect();
    }
}

testLogin();
