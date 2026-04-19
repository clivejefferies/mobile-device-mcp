(async function () {
  await import('./observe/logparse.test.ts')
  await import('./observe/logstream.test.ts')
  await import('./observe/get_screen_fingerprint.test.ts')

  await import('./manage/install.test.ts')
  await import('./manage/build.test.ts')
  await import('./manage/build_and_install.test.ts')
  await import('./manage/diagnostics.test.ts')
  await import('./manage/detection.test.ts')
  await import('./manage/mcp_disable_autodetect.test.ts')

  await import('./interact/wait_for_screen_change.test.ts')

  if (process.env.SKIP_DEVICE_TESTS === '1') {
    console.log('SKIP_DEVICE_TESTS=1 detected - skipping device-dependent unit tests')
  } else {
    try {
      await import('./observe/capture_debug_snapshot.test.ts')
      await import('./observe/find_element.test.ts')
      await import('./interact/wait_for_ui.test.ts')
    } catch (error) {
      console.warn('Skipping some device-dependent tests due to import error:', error instanceof Error ? error.message : String(error))
    }
  }

  console.log('Unit tests loaded.')
})().catch((error) => {
  console.error(error)
  process.exit(1)
})
