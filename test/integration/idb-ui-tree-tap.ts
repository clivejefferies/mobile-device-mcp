import { iOSObserve } from '../../src/ios/observe.js';
import { iOSInteract } from '../../src/ios/interact.js';
import { getIdbCmd, isIDBInstalled } from '../../src/ios/utils.js';

async function main() {
  const deviceId = 'booted';

  console.log('Checking idb availability...');
  const installed = await isIDBInstalled();
  if (!installed) {
    console.error('idb not found. Set MCP_IDB_PATH or IDB_PATH or create mcp.config.json with idbPath.');
    process.exit(2);
  }

  console.log('Using idb at:', getIdbCmd());

  const obs = new iOSObserve();
  const interact = new iOSInteract();

  console.log('Fetching UI tree...');
  const tree = await obs.getUITree(deviceId as any);
  if (tree.error) {
    console.error('getUITree error:', tree.error);
    process.exit(3);
  }

  console.log('Elements found:', tree.elements.length);
  if (!tree.elements || tree.elements.length === 0) {
    console.error('No elements found; aborting');
    process.exit(4);
  }

  const clickable = tree.elements.find(e => e.clickable) || tree.elements[0];
  console.log('Using element:', clickable.text || '(no text)', 'clickable=', clickable.clickable, 'center=', clickable.center);
  const [x, y] = clickable.center || [0, 0];

  console.log(`Tapping at ${x},${y}...`);
  const res = await interact.tap(x, y, deviceId as any);
  console.log('Tap result:', res);

  if (res.success) {
    console.log('Integration test: SUCCESS');
    process.exit(0);
  } else {
    console.error('Integration test: FAILURE');
    process.exit(5);
  }
}

main().catch(e => { console.error('Test runner error:', e); process.exit(10); });
