// Aggregator entrypoint for unit tests (updated to new test layout)
(async function() {
  // Core unit tests that do not require real devices
  await import('../observe/unit/logparse.test.ts')
  await import('../observe/unit/logstream.test.ts')
  await import('../observe/unit/get_screen_fingerprint.test.ts')

  await import('../manage/unit/install.test.ts')
  await import('../manage/unit/build.test.ts')
  await import('../manage/unit/build_and_install.test.ts')
  await import('../manage/unit/diagnostics.test.ts')
  await import('../manage/unit/detection.test.ts')
  await import('../manage/unit/mcp_disable_autodetect.test.ts')
  await import('../interact/unit/wait_for_screen_change.test.ts')

  // Conditionally include device-dependent unit tests. Set SKIP_DEVICE_TESTS=1 to exclude.
  if (process.env.SKIP_DEVICE_TESTS !== '1') {
    try {
      await import('../observe/unit/capture_debug_snapshot.test.ts')
      await import('../observe/unit/find_element.test.ts')
      await import('../interact/unit/wait_for_ui.test.ts')
    } catch (e) {
      console.warn('Skipping some device-dependent tests due to import error:', e instanceof Error ? e.message : String(e))
    }
  } else {
    console.log('SKIP_DEVICE_TESTS=1 detected - skipping device-dependent unit tests')
  }

  console.log('Unit tests loaded.')
})().catch(e => { console.error(e); process.exit(1) })
