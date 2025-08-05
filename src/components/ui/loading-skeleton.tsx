"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Professional Loading Skeleton for Services
export function ServicesLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Table Card Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Table Header */}
            <div className="grid grid-cols-7 gap-4 pb-2 border-b">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
            
            {/* Table Rows */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="grid grid-cols-7 gap-4 py-3">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Professional Loading Skeleton for Professionals
export function ProfessionalsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-10 w-44" />
      </div>

      {/* Table Card Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Table Header */}
            <div className="grid grid-cols-7 gap-4 pb-2 border-b">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
            
            {/* Table Rows */}
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="grid grid-cols-7 gap-4 py-4">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="flex flex-wrap gap-1">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-4 w-8" />
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Professional Loading Skeleton for Bookings Calendar
export function BookingsCalendarLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="flex items-center space-x-3">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
          <div className="flex rounded-lg border p-1 bg-gray-50">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </div>

      {/* Calendar Card Skeleton */}
      <Card className="shadow-sm border-0">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-12" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid Skeleton */}
          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
            {/* Week Days Header */}
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="bg-gray-50 p-3">
                <Skeleton className="h-4 w-8 mx-auto" />
              </div>
            ))}
            
            {/* Calendar Days */}
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="bg-white min-h-[120px] p-2">
                <Skeleton className="h-4 w-4 mb-2" />
                <div className="space-y-1">
                  {Math.random() > 0.7 && <Skeleton className="h-6 w-full rounded" />}
                  {Math.random() > 0.8 && <Skeleton className="h-6 w-full rounded" />}
                  {Math.random() > 0.9 && <Skeleton className="h-6 w-full rounded" />}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Professional Loading Skeleton for Bookings List
export function BookingsListLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="flex items-center space-x-3">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
          <div className="flex rounded-lg border p-1 bg-gray-50">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </div>

      {/* Booking Cards Skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="shadow-sm border-0">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {/* Avatar */}
                  <Skeleton className="w-12 h-12 rounded-full" />
                  
                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-56" />
                      </div>
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                    
                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        <Skeleton className="w-4 h-4" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Skeleton className="w-4 h-4" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-28" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Skeleton className="w-4 h-4" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 pt-3">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Professional Loading Skeleton for Booking Wizard
export function BookingWizardLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-5 w-96 mx-auto" />
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  {i < 3 && <Skeleton className="w-16 h-1 mx-4" />}
                </div>
              ))}
            </div>
          </div>

          {/* Main Content Card */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <Skeleton className="h-7 w-48 mx-auto mb-2" />
              <Skeleton className="h-4 w-80 mx-auto" />
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="p-6 rounded-xl border-2 border-gray-100 hover:border-blue-200 transition-all">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Skeleton className="w-4 h-4" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Skeleton className="h-12 w-24" />
            <Skeleton className="h-12 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Professional Loading Skeleton for Widget
export function WidgetLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 mb-6">
              <Skeleton className="w-10 h-10" />
            </div>
            <Skeleton className="h-12 w-80 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>

          {/* Widget Content */}
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8">
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-8 w-48 mb-2 bg-white/20" />
                  <Skeleton className="h-5 w-64 bg-white/20" />
                </div>
                <Skeleton className="w-16 h-16 rounded-full bg-white/20" />
              </div>
            </div>
            
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Services Section */}
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <Skeleton className="h-7 w-40 mb-4" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="p-4 rounded-lg border border-gray-200">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <Skeleton className="h-5 w-32" />
                              <Skeleton className="h-4 w-16 rounded-full" />
                            </div>
                            <Skeleton className="h-4 w-full" />
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Skeleton className="w-4 h-4" />
                                <Skeleton className="h-4 w-12" />
                              </div>
                              <Skeleton className="h-4 w-16" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  <div className="p-6 bg-gray-50 rounded-xl">
                    <Skeleton className="h-6 w-32 mb-4" />
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                  
                  <div className="p-6 bg-blue-50 rounded-xl">
                    <Skeleton className="h-6 w-28 mb-4" />
                    <div className="space-y-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <Skeleton className="h-4 w-12" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      ))}
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

// Professional Loading Skeleton for Dashboard
export function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="w-12 h-12 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 rounded-lg border">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-28" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-3 rounded-lg border">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}