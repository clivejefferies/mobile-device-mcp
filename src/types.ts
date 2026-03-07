export interface DeviceInfo {
  id: string;
  model: string;
  osVersion: string;
  manufacturer: string;
}

export interface StartAppResponse {
  device: DeviceInfo;
  appStarted: boolean;
  launchTimeMs: number;
}

export interface GetLogsResponse {
  device: DeviceInfo;
  logs: string[];
  logCount: number;
}

export interface CaptureAndroidScreenResponse {
  device: DeviceInfo;
  imagePath: string;
  resolution: {
    width: number;
    height: number;
  };
}

export interface CaptureIOSScreenshotResponse {
  device: DeviceInfo;
  screenshotData: string; // base64 encoded string
  orientation: 'portrait' | 'landscape';
}
