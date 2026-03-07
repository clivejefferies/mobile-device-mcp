import { exec } from "child_process"
import { StartIOSAppResponse, GetIOSLogsResponse, CaptureIOSScreenshotResponse } from "./types"

interface IOSResult {
  output: string
  device: string
}

function execCommand(command: string): Promise<IOSResult> {
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      if (err) reject({ error: stderr.trim(), device: "booted" })
      else resolve({ output: stdout.trim(), device: "booted" })
    })
  })
}

export async function startIOSApp(bundleId: string): Promise<StartIOSAppResponse> {
  const result = await execCommand(`xcrun simctl launch booted ${bundleId}`)
  return {
    device: result.device,
    output: result.output,
  }
}

export async function getIOSLogs(): Promise<GetIOSLogsResponse> {
  const result = await execCommand(`xcrun simctl spawn booted log show --style syslog --last 1m`)
  return {
    device: result.device,
    logs: result.output,
  }
}

export async function captureIOSScreenshot(filename: string): Promise<CaptureIOSScreenshotResponse> {
  const result = await execCommand(`xcrun simctl io booted screenshot ${filename}`)
  return {
    device: result.device,
    screenshotPath: filename,
  }
}