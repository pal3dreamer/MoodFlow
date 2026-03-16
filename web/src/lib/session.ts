import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./prisma";

export async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return null;
  }

  const email = session.user.email;
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: session.user.name || email.split("@")[0],
      },
    });
  }

  if (!user.name && session.user.name) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { name: session.user.name },
    });
  }

  return user;
}
