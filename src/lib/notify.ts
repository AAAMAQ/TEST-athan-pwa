export type PermissionState = 'default' | 'denied' | 'granted'
export async function requestNotificationPermission(): Promise<PermissionState> {
  if (!('Notification' in window)) return 'denied'
  return await Notification.requestPermission()
}
export function showNow(title: string, body: string) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  new Notification(title, { body })
}
type Sched = { title: string; when: Date }
let scheduled: number[] = []
export function clearScheduled() { scheduled.forEach(clearTimeout); scheduled = [] }
export function scheduleForToday(items: Sched[], minutesBefore = 0) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  clearScheduled()
  const now = Date.now()
  items.forEach(it => {
    const when = new Date(it.when.getTime() - minutesBefore*60_000).getTime()
    const delay = Math.max(0, when - now)
    scheduled.push(setTimeout(() => showNow('Prayer Reminder', `${it.title} is now.`), delay))
  })
  const midnight = new Date(); midnight.setHours(24,0,0,0)
  scheduled.push(setTimeout(clearScheduled, midnight.getTime() - Date.now() + 1000))
}