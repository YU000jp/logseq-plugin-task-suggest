import { AppUserConfigs } from "@logseq/libs/dist/LSPlugin.user"
import { parse, setDefaultOptions } from "date-fns"
// import { addDays, addMonths, addWeeks, addYears, endOfDay, endOfMonth, endOfWeek, parse, setDefaultOptions, startOfDay, startOfMonth, startOfWeek } from "date-fns"

export function convertToDate(dateSet) {
  try {
    const dateStr = dateSet[0]
    const date = parse(dateStr, dateFormat, new Date())
    return date
  } catch (err) {
    return null
  }
}

// export const UNITS = new Set(["y", "m", "w", "d"])

// export const addUnit = {
//   y: addYears,
//   m: addMonths,
//   w: addWeeks,
//   d: addDays,
// }

// export const startOfUnit = {
//   y: (date) => new Date(date.getFullYear(), 0, 1),
//   m: startOfMonth,
//   w: startOfWeek,
//   d: startOfDay,
// }

// export const endOfUnit = {
//   y: (date) => new Date(date.getFullYear(), 11, 31, 23, 59, 59),
//   m: endOfMonth,
//   w: endOfWeek,
//   d: endOfDay,
// }

let dateFormat

export function setDateOptions(format, weekStartsOn) {
  dateFormat = format
  setDefaultOptions({ weekStartsOn })
}

// export function parseDateRange(rangeStr) {
//   const range = rangeStr
//     .split(/~|～/)
//     .map((part) => {
//       part = part.trim()
//       if (part.length === 8 && /[0-9]/.test(part[7])) {
//         try {
//           const date = parse(part, "yyyyMMdd", new Date())
//           return [date, date]
//         } catch (err) {
//           return null
//         }
//       } else {
//         const quantity = +part.substring(0, part.length - 1)
//         const unit = part[part.length - 1]
//         if (isNaN(quantity) || !UNITS.has(unit)) return null
//         const anchor = addUnit[unit](new Date(), quantity)
//         const start = startOfUnit[unit](anchor)
//         const end = endOfUnit[unit](anchor)
//         return [start, end]
//       }
//     })
//     .filter((part) => part != null)
//     .flat()
//   if (range.length < 2) return []
//   return [range[0], range[range.length - 1]]
// }

export async function configureUserDateOptions() {
  const { preferredDateFormat, preferredStartOfWeek } = (await logseq.App.getUserConfigs()) as AppUserConfigs
  const weekStart = (+(preferredStartOfWeek ?? 6) + 1) % 7
  setDateOptions(preferredDateFormat, weekStart)
}

