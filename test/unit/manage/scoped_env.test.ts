import assert from 'assert'
import { ToolsManage } from '../../../src/manage/index.js'
import { AndroidManage } from '../../../src/manage/android.js'
import { iOSManage } from '../../../src/manage/ios.js'

async function run() {
  const originalAndroidBuild = AndroidManage.prototype.build
  const originalIOSBuild = iOSManage.prototype.build
  const originalGradleWorkers = process.env.MCP_GRADLE_WORKERS
  const originalGradleCache = process.env.MCP_GRADLE_CACHE
  const originalForceCleanAndroid = process.env.MCP_FORCE_CLEAN_ANDROID
  const originalDerivedData = process.env.MCP_DERIVED_DATA
  const originalBuildJobs = process.env.MCP_BUILD_JOBS
  const originalForceCleanIOS = process.env.MCP_FORCE_CLEAN_IOS
  const originalDestination = process.env.MCP_XCODE_DESTINATION_UDID

  try {
    AndroidManage.prototype.build = async function () {
      assert.strictEqual(process.env.MCP_GRADLE_WORKERS, '3')
      assert.strictEqual(process.env.MCP_GRADLE_CACHE, '0')
      assert.strictEqual(process.env.MCP_FORCE_CLEAN_ANDROID, '1')
      return { artifactPath: '/tmp/fake.apk' }
    }

    iOSManage.prototype.build = async function () {
      assert.strictEqual(process.env.MCP_DERIVED_DATA, '/tmp/derived')
      assert.strictEqual(process.env.MCP_BUILD_JOBS, '4')
      assert.strictEqual(process.env.MCP_FORCE_CLEAN_IOS, '1')
      assert.strictEqual(process.env.MCP_XCODE_DESTINATION_UDID, 'booted')
      return { artifactPath: '/tmp/Fake.app' }
    }

    delete process.env.MCP_GRADLE_WORKERS
    delete process.env.MCP_GRADLE_CACHE
    delete process.env.MCP_FORCE_CLEAN_ANDROID
    delete process.env.MCP_DERIVED_DATA
    delete process.env.MCP_BUILD_JOBS
    delete process.env.MCP_FORCE_CLEAN_IOS
    delete process.env.MCP_XCODE_DESTINATION_UDID

    await ToolsManage.build_android({
      projectPath: '/tmp/project',
      maxWorkers: 3,
      gradleCache: false,
      forceClean: true
    })

    await ToolsManage.build_ios({
      projectPath: '/tmp/project',
      derivedDataPath: '/tmp/derived',
      buildJobs: 4,
      forceClean: true,
      destinationUDID: 'booted'
    })

    assert.strictEqual(process.env.MCP_GRADLE_WORKERS, undefined)
    assert.strictEqual(process.env.MCP_GRADLE_CACHE, undefined)
    assert.strictEqual(process.env.MCP_FORCE_CLEAN_ANDROID, undefined)
    assert.strictEqual(process.env.MCP_DERIVED_DATA, undefined)
    assert.strictEqual(process.env.MCP_BUILD_JOBS, undefined)
    assert.strictEqual(process.env.MCP_FORCE_CLEAN_IOS, undefined)
    assert.strictEqual(process.env.MCP_XCODE_DESTINATION_UDID, undefined)

    console.log('manage scoped env tests passed')
  } finally {
    AndroidManage.prototype.build = originalAndroidBuild
    iOSManage.prototype.build = originalIOSBuild

    if (originalGradleWorkers === undefined) delete process.env.MCP_GRADLE_WORKERS
    else process.env.MCP_GRADLE_WORKERS = originalGradleWorkers

    if (originalGradleCache === undefined) delete process.env.MCP_GRADLE_CACHE
    else process.env.MCP_GRADLE_CACHE = originalGradleCache

    if (originalForceCleanAndroid === undefined) delete process.env.MCP_FORCE_CLEAN_ANDROID
    else process.env.MCP_FORCE_CLEAN_ANDROID = originalForceCleanAndroid

    if (originalDerivedData === undefined) delete process.env.MCP_DERIVED_DATA
    else process.env.MCP_DERIVED_DATA = originalDerivedData

    if (originalBuildJobs === undefined) delete process.env.MCP_BUILD_JOBS
    else process.env.MCP_BUILD_JOBS = originalBuildJobs

    if (originalForceCleanIOS === undefined) delete process.env.MCP_FORCE_CLEAN_IOS
    else process.env.MCP_FORCE_CLEAN_IOS = originalForceCleanIOS

    if (originalDestination === undefined) delete process.env.MCP_XCODE_DESTINATION_UDID
    else process.env.MCP_XCODE_DESTINATION_UDID = originalDestination
  }
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
