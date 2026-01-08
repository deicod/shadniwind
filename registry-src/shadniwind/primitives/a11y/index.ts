import { Platform } from "react-native"

export function ariaAttr(condition: boolean | undefined): boolean | undefined {
  return condition ? true : undefined
}

export const nativeRole = Platform.select({
  web: (role: string) => role as unknown,
  default: (role: string) => role as unknown,
})
