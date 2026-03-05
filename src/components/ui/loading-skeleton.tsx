import React from 'react';
import { Skeleton } from './skeleton';
import { Card, CardContent, CardHeader } from './card';

export const DiagnosticFormSkeleton = () => (
  <Card className="shadow-medium">
    <CardHeader className="pb-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-5 w-5 rounded-full" />
      </div>
      <Skeleton className="h-7 w-3/4" />
      <Skeleton className="h-4 w-full" />
    </CardHeader>
    <CardContent className="space-y-6">
      <Skeleton className="h-32 w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
      </div>
      <div className="flex justify-between pt-6">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
    </CardContent>
  </Card>
);
