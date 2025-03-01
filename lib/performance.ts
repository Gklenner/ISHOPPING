"use server"

export async function reportWebVitals(metric: any) {
  const body = JSON.stringify(metric)
  const url = "/api/analytics"

  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, body)
  } else {
    await fetch(url, { body, method: "POST", keepalive: true })
  }
}

