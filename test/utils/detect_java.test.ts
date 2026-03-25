import fs from 'fs'
import path from 'path'
import { detectJavaHome } from '../../src/utils/java.js'

async function run() {
  // Create a temporary fake JDK that reports Java 17
  const tmp = fs.mkdtempSync('/tmp/fakejdk-')
  const bin = path.join(tmp, 'bin')
  fs.mkdirSync(bin)
  const javaSh = path.join(bin, 'java')
  fs.writeFileSync(javaSh, '#!/bin/sh\necho "openjdk version \"17.0.2\"" >&2\nexit 0\n')
  fs.chmodSync(javaSh, 0o755)

  process.env.ANDROID_STUDIO_JDK = tmp

  const detected = await detectJavaHome()
  console.log('DETECTED:', detected)
  if (detected !== tmp) {
    console.error('TEST FAIL: expected', tmp, 'got', detected)
    process.exit(2)
  }
  console.log('TEST PASS')
}

run().catch(e => { console.error(e); process.exit(1) })
