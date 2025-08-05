"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon } from "lucide-react";

export function BookingPageLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header Skeleton */}
      <div className="mb-8">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Form Skeleton */}
        <div className="lg:col-span-2">
          <Card className="h-fit">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-96" />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Client Information Section */}
                <div className="space-y-4">
                  <div className="border-b pb-4">
                    <Skeleton className="h-5 w-44 mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </div>
                    <div className="space-y-2 mt-4">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-10 w-64" />
                    </div>
                  </div>

                  {/* Service Selection Section */}
                  <div className="space-y-4">
                    <Skeleton className="h-5 w-48" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <Skeleton className="h-12 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Date & Time Skeleton */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-4 w-72" />
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date Section */}
              <div className="space-y-3">
                <Skeleton className="h-4 w-16" />
                <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center bg-gray-50">
                  <div className="h-8 w-8 mx-auto mb-3 bg-gray-200 rounded animate-pulse flex items-center justify-center">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <Skeleton className="h-4 w-48 mx-auto" />
                </div>
              </div>

              {/* Time Slots Section */}
              <div className="space-y-4">
                <Skeleton className="h-4 w-40" />
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                  <div className="h-12 w-12 mx-auto mb-3 bg-gray-200 rounded animate-pulse flex items-center justify-center">
                    <CalendarIcon className="h-6 w-6 text-gray-400 opacity-50" />
                  </div>
                  <Skeleton className="h-4 w-64 mx-auto" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Alternative loading with time slots preview
export function BookingPageWithSlotsLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header Skeleton */}
      <div className="mb-8">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Form Skeleton */}
        <div className="lg:col-span-2">
          <Card className="h-fit">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-96" />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Client Information Section */}
                <div className="space-y-4">
                  <div className="border-b pb-4">
                    <Skeleton className="h-5 w-44 mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </div>
                    <div className="space-y-2 mt-4">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-10 w-64" />
                    </div>
                  </div>

                  {/* Service Selection Section */}
                  <div className="space-y-4">
                    <Skeleton className="h-5 w-48" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <Skeleton className="h-12 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Date & Time with Preview */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-4 w-72" />
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date Section */}
              <div className="space-y-3">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-12 w-full" />
              </div>

              {/* Time Slots Section with Preview */}
              <div className="space-y-4">
                <Skeleton className="h-4 w-40" />
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <Skeleton 
                        key={i} 
                        className={`h-10 w-full ${
                          Math.random() > 0.3 ? '' : 'opacity-50'
                        }`} 
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 pt-2 border-t">
                    <div className="flex items-center space-x-1">
                      <Skeleton className="w-3 h-3 rounded" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <div className="flex items-center space-x-1">
                      <Skeleton className="w-3 h-3 rounded" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}