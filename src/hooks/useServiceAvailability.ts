import { useState, useCallback, useRef } from "react";
import {
  ServiceAvailability,
  AvailableSlot,
  Service,
} from "@/types/booking-wizard";

// Helper function for fetch with retry
const fetchWithRetry = async (
  url: string,
  options: RequestInit = {},
  retries = 2
): Promise<Response> => {
  for (let i = 0; i <= retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      if (i === retries) throw error;

      console.log(`🔄 Retry attempt ${i + 1}/${retries} for ${url}`);
      // Wait before retry (exponential backoff)
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, i) * 1000)
      );
    }
  }
  throw new Error("Max retries exceeded");
};

export function useServiceAvailability(tenantId: string) {
  const [serviceAvailability, setServiceAvailability] = useState<
    ServiceAvailability[]
  >([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Use ref to store latest serviceAvailability without causing re-renders in callbacks
  const serviceAvailabilityRef = useRef<ServiceAvailability[]>([]);
  serviceAvailabilityRef.current = serviceAvailability;

  // Fetch service availability when service is selected
  const fetchServiceAvailability = useCallback(
    async (serviceId: string) => {
      console.log("🔧 Fetching service availability for:", serviceId);
      try {
        setLoading(true);
        setError("");
        const url = `/api/widget/tenant/${tenantId}/services/${serviceId}/availability`;
        console.log("📡 Service availability URL:", url);

        const response = await fetchWithRetry(url);

        console.log(
          "📥 Service availability response status:",
          response.status
        );

        if (response.ok) {
          const data = await response.json();
          console.log("📦 Service availability data:", data);
          console.log("🗓️ Availability schedule:", data.availabilitySchedule);
          setServiceAvailability(data.availabilitySchedule || []);
        } else {
          const errorText = await response.text();
          console.error("❌ HTTP Error:", response.status, errorText);
          setError(`Error del servidor: ${response.status}`);
        }
      } catch (error) {
        console.error("💥 Error fetching service availability:", error);

        if (error instanceof Error) {
          if (error.name === "AbortError") {
            setError(
              "Tiempo de espera agotado. Verifica tu conexión a internet."
            );
          } else if (error.message.includes("Failed to fetch")) {
            setError(
              "Error de conexión. Verifica tu conexión a internet e intenta nuevamente."
            );
          } else {
            setError(`Error: ${error.message}`);
          }
        } else {
          setError("Error desconocido al cargar los horarios disponibles");
        }
      } finally {
        setLoading(false);
      }
    },
    [tenantId]
  );

  // Generate available slots when date is selected
  const generateAvailableSlots = useCallback(
    async (date: string, service: Service) => {
      if (!service) {
        console.log("❌ No service selected");
        return;
      }

      console.log("🔍 Generating slots for:", {
        date,
        service: service.name,
        serviceId: service.id,
        tenantId,
      });

      try {
        setLoading(true);
        setError("");

        // Use the availability endpoint to get actual available slots
        const url = `/api/widget/tenant/${tenantId}/services/${service.id}/availability?date=${date}`;
        console.log("📡 Calling API:", url);

        const response = await fetchWithRetry(url);

        console.log("📥 API Response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("📦 API Response data:", data);

          if (
            data.success &&
            data.availability &&
            data.availability.length > 0
          ) {
            const availableSlots: AvailableSlot[] = data.availability
              .filter((slot: { available: boolean }) => slot.available)
              .map((slot: { time: string; professionals?: unknown[] }) => ({
                date: date,
                time: slot.time,
                datetime: `${date}T${slot.time}:00`,
                professionals: slot.professionals || [],
              }));

            console.log("✅ Available slots found:", availableSlots.length);
            console.log("🎯 Slots details:", availableSlots);
            setAvailableSlots(availableSlots);
            return;
          }
        } else {
          const errorText = await response.text();
          console.error(
            "❌ HTTP Error in generateAvailableSlots:",
            response.status,
            errorText
          );
          // Continue to fallback instead of throwing error
        }

        // Fallback: Generate slots from serviceAvailability if API fails or returns no data
        console.log(
          "🔄 Fallback to serviceAvailability:",
          serviceAvailabilityRef.current
        );

        const selectedDateObj = new Date(date);
        const dayOfWeek = selectedDateObj.getDay(); // 0 = Sunday, 1 = Monday, etc.

        console.log("📅 Selected day of week:", dayOfWeek);

        // Find availability for this day
        const dayAvailability = serviceAvailabilityRef.current.find(
          (availability) =>
            availability.dayOfWeek === dayOfWeek && availability.isActive
        );

        console.log("🕒 Day availability found:", dayAvailability);

        if (dayAvailability) {
          // Generate time slots from startTime to endTime
          const slots: AvailableSlot[] = [];
          const startHour = parseInt(dayAvailability.startTime.split(":")[0]);
          const startMinute = parseInt(dayAvailability.startTime.split(":")[1]);
          const endHour = parseInt(dayAvailability.endTime.split(":")[0]);
          const endMinute = parseInt(dayAvailability.endTime.split(":")[1]);

          // Create slots every 30 minutes
          for (
            let hour = startHour;
            hour < endHour || (hour === endHour && startMinute < endMinute);
            hour++
          ) {
            for (
              let minute = hour === startHour ? startMinute : 0;
              minute < 60;
              minute += 30
            ) {
              if (hour === endHour && minute >= endMinute) break;

              const timeString = `${hour.toString().padStart(2, "0")}:${minute
                .toString()
                .padStart(2, "0")}`;
              slots.push({
                date: date,
                time: timeString,
                datetime: `${date}T${timeString}:00`,
                professionals: [], // Will be populated based on selection
              });
            }
          }

          console.log(
            "✅ Generated slots from serviceAvailability:",
            slots.length
          );
          console.log("🎯 Generated slots:", slots);
          setAvailableSlots(slots);
        } else {
          console.log("❌ No availability configuration for this day");
          setAvailableSlots([]);
        }
      } catch (error) {
        console.error("💥 Exception in generateAvailableSlots:", error);

        if (error instanceof Error) {
          if (error.name === "AbortError") {
            setError("Tiempo de espera agotado al verificar disponibilidad.");
          } else if (error.message.includes("Failed to fetch")) {
            setError(
              "Error de conexión al verificar disponibilidad. Verifica tu conexión a internet."
            );
          } else {
            setError(`Error al verificar disponibilidad: ${error.message}`);
          }
        } else {
          setError("Error desconocido al verificar disponibilidad");
        }

        setAvailableSlots([]);
      } finally {
        setLoading(false);
      }
    },
    [tenantId] // Removemos serviceAvailability ya que usamos ref
  );

  const isDateAvailable = useCallback(
    (dayOfWeek: number) => {
      const available = serviceAvailabilityRef.current.some(
        (av) => av.dayOfWeek === dayOfWeek && av.isActive
      );
      console.log(
        `📅 Date availability check - dayOfWeek: ${dayOfWeek}, available: ${available}`,
        {
          serviceAvailability: serviceAvailabilityRef.current,
          matchingConfigs: serviceAvailabilityRef.current.filter(
            (av) => av.dayOfWeek === dayOfWeek
          ),
        }
      );
      return available;
    },
    [] // Sin dependencias ya que usa ref
  );

  const retryFetchAvailability = useCallback(
    (serviceId: string) => {
      console.log("🔄 Retrying fetchServiceAvailability...");
      return fetchServiceAvailability(serviceId);
    },
    [fetchServiceAvailability]
  );

  const retryGenerateSlots = useCallback(
    (date: string, service: Service) => {
      console.log("🔄 Retrying generateAvailableSlots...");
      return generateAvailableSlots(date, service);
    },
    [generateAvailableSlots]
  );

  return {
    serviceAvailability,
    availableSlots,
    loading,
    error,
    fetchServiceAvailability,
    generateAvailableSlots,
    isDateAvailable,
    setAvailableSlots,
    setError,
    retryFetchAvailability,
    retryGenerateSlots,
  };
}
