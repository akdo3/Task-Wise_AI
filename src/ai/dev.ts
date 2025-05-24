import { config } from 'dotenv';
config();

import '@/ai/flows/ai-task-assistant.ts';
import '@/ai/flows/generate-task-image-flow.ts';
import '@/ai/flows/suggest-random-task-flow.ts';
import '@/ai/flows/daily-motivation-flow.ts';
import '@/ai/flows/review-task-image-flow.ts'; // Added import for the new flow
