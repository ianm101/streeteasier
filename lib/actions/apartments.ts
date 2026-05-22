"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getApartments() {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const apartments = await prisma.apartment.findMany({
    include: {
      addedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      pointPerson: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      amenities: true,
      rankings: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      apartmentNotes: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return apartments;
}

export async function getApartmentById(id: string) {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const apartment = await prisma.apartment.findUnique({
    where: { id },
    include: {
      addedBy: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      pointPerson: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      amenities: true,
      rankings: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
      apartmentNotes: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  return apartment;
}

export async function updateApartmentStatus(id: string, status: string) {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  await prisma.apartment.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/apartments/${id}`);
}

export async function deleteApartment(id: string) {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  await prisma.apartment.delete({
    where: { id },
  });

  revalidatePath("/dashboard");
}

interface CreateApartmentInput {
  address: string;
  unit?: string;
  neighborhood?: string;
  borough?: string;
  price?: number;
  beds?: number;
  baths?: number;
  sqft?: number;
  floor?: number;
  listingUrl?: string;
  source: string;
  status?: string;
  brokerName?: string;
  brokerEmail?: string;
  brokerPhone?: string;
  pointPersonId?: string;
  amenities?: string[];
  notes?: string;
}

export async function createApartment(input: CreateApartmentInput) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // If there's a StreetEasy URL, scrape photos
  let photoUrls: string[] = [];
  let scrapedData: any = null;

  if (input.listingUrl && input.listingUrl.includes("streeteasy.com")) {
    try {
      const { scrapeStreetEasyListing } = await import("@/lib/scrapers/streeteasy");
      scrapedData = await scrapeStreetEasyListing(input.listingUrl);
      photoUrls = scrapedData.photoUrls || [];

      // Use scraped data to fill in missing fields
      if (!input.price && scrapedData.price) input.price = scrapedData.price;
      if (!input.beds && scrapedData.beds) input.beds = scrapedData.beds;
      if (!input.baths && scrapedData.baths) input.baths = scrapedData.baths;
      if (!input.sqft && scrapedData.sqft) input.sqft = scrapedData.sqft;
    } catch (error) {
      console.error("Error scraping StreetEasy:", error);
      // Continue with apartment creation even if scraping fails
    }
  }

  const apartment = await prisma.apartment.create({
    data: {
      address: input.address,
      unit: input.unit || null,
      neighborhood: input.neighborhood || null,
      borough: input.borough || null,
      price: input.price || null,
      beds: input.beds || null,
      baths: input.baths || null,
      sqft: input.sqft || null,
      floor: input.floor || null,
      listingUrl: input.listingUrl || null,
      photoUrls: photoUrls,
      source: input.source,
      status: input.status || "interested",
      brokerName: input.brokerName || null,
      brokerEmail: input.brokerEmail || null,
      brokerPhone: input.brokerPhone || null,
      notes: input.notes || null,
      addedById: session.user.id,
      pointPersonId: input.pointPersonId || null,
      amenities: input.amenities
        ? {
            create: input.amenities.map((key) => ({
              key,
            })),
          }
        : undefined,
    },
  });

  revalidatePath("/dashboard");
  return apartment.id;
}
