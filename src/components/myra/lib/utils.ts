import chroma from 'chroma-js'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Utility function to merge Tailwind CSS classes
// Combines clsx for conditional classes and tailwind-merge to handle conflicts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format a date to display time in 12-hour format
export const formatTime = (date: Date | string): string => {
  const dateObj = new Date(date)
  return dateObj.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}
export const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "operational":
      case "commissioned":
        return "success";
      case "under construction":
      case "planned":
        return "warning";
      case "inactive":
      case "cancelled":
        return "error";
      default:
        return "warning";
    }
  };

// Generate MongoDB-style ObjectId (24 hex chars)
export const generateObjectId = (): string => {
  const timestamp = Math.floor(Date.now() / 1000).toString(16)
  const randomBytes = Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('')
  return (timestamp + randomBytes).substring(0, 24)
}

// Generate a UUID v4-like ID
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export const debounceFn = <T extends (...args: any[]) => void>(
  fn: T,
  time = 2000
) => {
  let timeoutId: NodeJS.Timeout | null = null

  const debounced = (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      fn(...args)
      timeoutId = null
    }, time)
  }

  // Add a cancel method to manually clear the timeout
  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  return debounced
}
/**
 * Generates a list of visually distinct colors for chart elements.
 *
 * This function starts with a predefined base color palette and ensures each color
 * in the returned list is unique. If the number of required colors (`count`) exceeds
 * the number of base colors, it applies incremental brightening to generate
 * distinguishable variants while maintaining visual consistency.
 *
 * Useful for scenarios like:
 * - Pie charts with many segments
 * - Bar/line charts with dynamic or unknown data series
 *
 * @param {number} count - Total number of unique colors needed.
 * @returns {string[]} An array of HEX color strings.
 */
export const generateChartColors = (count: number): string[] => {
  const baseColors = [
    '#4A90E2',
    '#3FD0D9',
    '#9889F2',
    '#65789B',
    '#FFAC01',
    '#F38141',
    '#2E5F84',
    '#802392',
    '#002F75',
    '#7D7E75',
    '#CC7BAE',
    '#5AD054',
    '#EF6663',
    '#CD9265',
    '#B2B2B2'
  ]

  const totalColors: string[] = []
  const seenColors = new Set<string>()

  let i = 0
  while (totalColors.length < count) {
    const base = baseColors[i % baseColors.length]
    let shadeIndex = Math.floor(i / baseColors.length)
    let modifiedColor = chroma(base)
      .brighten(shadeIndex * 0.3)
      .hex()

    // Keep brightening until we find a unique color
    while (seenColors.has(modifiedColor.toLowerCase())) {
      shadeIndex += 1
      modifiedColor = chroma(base)
        .brighten(shadeIndex * 0.3)
        .hex()
    }

    seenColors.add(modifiedColor.toLowerCase())
    totalColors.push(modifiedColor)
    i++
  }

  return totalColors
}

export function sendEventToDataLayer(
  eventName: string,
  retryCount = 0,
  dataObject?: Record<string, any> | null
): void {
  if (typeof eventName !== 'string' || eventName.trim().length === 0) return

  if (typeof window !== 'undefined') {
    if (!window.dataLayer) {
      window.dataLayer = []
    }

    const payload =
      dataObject &&
      typeof dataObject === 'object' &&
      Object.keys(dataObject || {}).length > 0
        ? { event: eventName, ...dataObject }
        : { event: eventName }

    window.dataLayer.push(payload)
    return
  }

  if (retryCount >= 5) {
    console.error('dataLayer is still not available after 5 retries')
    return
  }

  // Retry in 1 second
  setTimeout(() => {
    sendEventToDataLayer(eventName, retryCount + 1, dataObject)
  }, 1000)
}
