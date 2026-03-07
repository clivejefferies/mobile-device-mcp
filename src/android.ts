import { exec } from "child_process"
import { StartAndroidAppResponse, GetAndroidLogsResponse, GetAndroidCrashResponse, CaptureAndroidScreenResponse } from "./types"

const ADB = process.env.ADB_PATH || "adb"

function getDeviceInfo(): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(`${ADB} get-state`, (err, stdout, stderr) => {
      if (err) reject(stderr || err.message)
      else resolve(stdout.trim())
    })
  })
}

export async function startAndroidApp(pkg: string): Promise<StartAndroidAppResponse> {
  const device = await getDeviceInfo()
  return new Promise((resolve, reject) => {
    exec(
      `${ADB} shell monkey -p ${pkg} -c android.intent.category.LAUNCHER 1`,
      (err, stdout, stderr) => {
        if (err) reject(stderr)
        else resolve({ device, output: stdout })
      }
    )
  })
}

export async function getAndroidLogs(pkg: string, lines = 200): Promise<GetAndroidLogsResponse> {
  const device = await getDeviceInfo()
  return new Promise((resolve, reject) => {
    exec(`${ADB} shell pidof -s ${pkg}`, (pidErr, pidStdout, pidStderr) => {
      if (pidErr || !pidStdout.trim()) {
        reject(pidStderr || "App process not running")
        return
      }

      const pid = pidStdout.trim()

      exec(`${ADB} logcat -d --pid=${pid} -t ${lines} -v threadtime`, (err, stdout, stderr) => {
        if (err) reject(stderr || err.message)
        else resolve({ device, logs: stdout })
      })
    })
  })
}

export async function getAndroidCrash(pkg: string, lines = 200): Promise<GetAndroidCrashResponse> {
  const device = await getDeviceInfo()
  try {
    const logs = await getAndroidLogs(pkg, lines)
    const crashLines = logs.logs
      .split('\n')
      .filter(line => line.includes('FATAL EXCEPTION'))
    if (crashLines.length === 0) {
      return { device, crashes: "No crashes found." }
    }
    return { device, crashes: crashLines.join('\n') }
  } catch (error) {
    return { device, crashes: `Error retrieving crash logs: ${error}` }
  }
}

export async function captureAndroidScreen(): Promise<CaptureAndroidScreenResponse> {
  const device = await getDeviceInfo()
  return new Promise((resolve, reject) => {
    exec(`${ADB} exec-out screencap -p`, { encoding: 'buffer' }, (err, stdout, stderr) => {
      if (err) {
        reject(stderr || err.message)
      } else {
        const base64Screenshot = stdout.toString('base64')
        resolve({ device, screenshot: base64Screenshot })
      }
    })
  })
}