import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(170),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.enum(['ai-tools', 'tutorials', 'reviews', 'dev-productivity']),
    tags: z.array(z.string()).default([]),
    author: z.string().default('Amgd Al-Subaihi'),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
