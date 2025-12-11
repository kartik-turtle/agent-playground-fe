export const setItemToLocalStorage = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value)) // Stringify to handle objects
  } catch (error) {
    console.error(`Error setting ${key} to localStorage: `, error)
  }
}

export const getItemFromLocalStorage = (key: string) => {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : null // Parse the JSON string back to the original value
  } catch (error) {
    console.error(`Error getting ${key} from localStorage: `, error)
    return null
  }
}

export const removeItemFromLocalStorage = (key: string) => {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`Error removing ${key} from localStorage: `, error)
  }
}

export const setItemToSessionStorage = (key: string, value: any) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Error setting ${key} to sessionStorage: `, error)
  }
}

export const getItemFromSessionStorage = (key: string) => {
  try {
    const value = sessionStorage.getItem(key)
    return value ? JSON.parse(value) : null // Parse the JSON string back to the original value
  } catch (error) {
    console.error(`Error getting ${key} from sessionStorage: `, error)
    return null
  }
}

export const removeItemFromSessionStorage = (key: string) => {
  try {
    sessionStorage.removeItem(key)
  } catch (error) {
    console.error(`Error removing ${key} from sessionStorage: `, error)
  }
}

export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return function (...args: Parameters<T>): void {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

export function debouncePromise<T extends (...args: any[]) => Promise<any>>(fn: T, delay: number) {
  type Result = Awaited<ReturnType<T>>

  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let resolver: ((value: Result) => void) | null = null

  return function (...args: Parameters<T>): Promise<Result> {
    if (timeoutId) clearTimeout(timeoutId)

    return new Promise(resolve => {
      resolver = resolve

      timeoutId = setTimeout(async () => {
        const result = await fn(...args)
        resolver?.(result)
      }, delay)
    })
  }
}
