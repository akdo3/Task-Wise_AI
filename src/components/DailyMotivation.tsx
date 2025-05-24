
"use client";

import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Lightbulb } from 'lucide-react';

interface DailyMotivationProps {
  motivation: { quote: string; date: string } | null;
  isLoading: boolean;
}

export const DailyMotivation: FC<DailyMotivationProps> = ({ motivation, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="mb-8 shadow-md animate-pulse">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Lightbulb className="mr-2 h-5 w-5 text-yellow-400" />
            Daily Dose of Wisdom
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (!motivation?.quote) {
    return null; // Don't render if no motivation and not loading
  }

  return (
    <Card className="mb-8 shadow-md bg-accent/5 border-accent/20">
      <CardHeader>
        <CardTitle className="text-lg flex items-center text-accent/90">
          <Lightbulb className="mr-2 h-5 w-5 text-yellow-400 fill-yellow-400/50" />
          Daily Dose of Wisdom
        </CardTitle>
      </CardHeader>
      <CardContent>
        <blockquote className="italic text-foreground/90">
          "{motivation.quote}"
        </blockquote>
      </CardContent>
    </Card>
  );
};
