(async function main(){
  try{
    const inter = await import('../../src/interact/index.ts')
    const manage = await import('../../src/manage/index.ts')
    const ToolsInteract = (inter as any).ToolsInteract
    const ToolsManage = (manage as any).ToolsManage

    const ANDROID_ID = process.env.ANDROID_DEVICE || 'emulator-5554'
    const IOS_UDID = process.env.IOS_DEVICE || '2EFFD8FD-5D09-47CC-95F8-28BBE30AF7ED'
    console.log('Device test starting. Android:', ANDROID_ID, 'iOS:', IOS_UDID)

    // Start modul8 on both platforms if present
    try { await ToolsManage.startAppHandler({ platform: 'android', appId: 'com.ideamechanics.modul8', deviceId: ANDROID_ID }); console.log('Started android app (if installed)') } catch(e){ console.error('Android start skipped:', e.message || e) }
    try { await ToolsManage.startAppHandler({ platform: 'ios', appId: 'com.ideamechanics.modul8.Modul8', deviceId: IOS_UDID }); console.log('Started ios app (if installed)') } catch(e){ console.error('iOS start skipped:', e.message || e) }

    // Observe UI for Generate Session on both devices (will timeout if not present)
    const aRes = await ToolsInteract.observeUntilHandler({ type: 'ui', query: 'Generate Session', timeoutMs: 20000, pollIntervalMs: 500, platform: 'android', deviceId: ANDROID_ID })
    console.log('Android observe result:', JSON.stringify(aRes, null, 2))

    const iRes = await ToolsInteract.observeUntilHandler({ type: 'ui', query: 'Generate Session', timeoutMs: 20000, pollIntervalMs: 500, platform: 'ios', deviceId: IOS_UDID })
    console.log('iOS observe result:', JSON.stringify(iRes, null, 2))

  } catch (e) { console.error('ERR', e); process.exit(1) }
})()
