import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const sponsorSchema = z.object({
  name: z.string(),
  logo: z.string().optional(),
  url: z.url(),
  raw: z.boolean().optional(),
  screen: z.boolean().optional(),
});

const event = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/event' }),
  schema: z.object({
    year: z.number().int().positive(),
    name: z.string(),
    date: z.string(),
    dateShort: z.string(),
    dateDay: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    deadline: z.string(),
    isoStart: z.string(),
    isoEnd: z.string(),
    capacity: z.number().int().positive(),
    registered: z.number().int().min(0).default(0),
    priceMember: z.number().positive(),
    priceGuest: z.number().positive(),
    priceDayOf: z.number().positive(),
    reg: z.url(),
  }),
});

const sponsors = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/sponsors' }),
  schema: z.object({
    gold: z.array(sponsorSchema),
    silver: z.array(sponsorSchema),
    bronze: z.array(sponsorSchema),
  }),
});

export const collections = { event, sponsors };
