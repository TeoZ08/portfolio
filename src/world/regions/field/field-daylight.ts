// One art-directed default, shared by sky, fog and the shadow-casting sun.
export const FIRST_LIGHT_HOUR = 9; // Optional legacy morning.
export const SUNSET_DEFAULT_HOUR = 17.5;
export function fieldDaylight(hour: number) {
  if (hour >= 19 || hour < 6) return {
    upper: "#10273e", horizon: "#7a9aa6", sun: "#b9d7f4",
    direction: [-.35, .46, -.82] as const,
    intensity: .65, fill: .65, fogNear: 70, fogFar: 230, night: true, sunset: false,
  };
  if (hour < 13) return {
    upper: "#2f70a7", horizon: "#c3dce3", sun: "#ffe5b2",
    direction: [-.55, .23, -.80] as const,
    intensity: 2.8, fill: 1.15, fogNear: 42, fogFar: 190, night: false, sunset: false,
  };
  if (hour >= 16) return {
    upper: "#536e94", horizon: "#ecaa79", sun: "#ffbc79",
    direction: [-.72, .145, -.67] as const,
    intensity: 2.85, fill: 1.2, fogNear: 48, fogFar: 205, night: false, sunset: true,
  };
  return {
    upper: "#4c7d9e", horizon: "#e9c99f", sun: "#ffd094",
    direction: [-.72, .18, -.67] as const,
    intensity: 2.5, fill: 1.05, fogNear: 38, fogFar: 175, night: false, sunset: false,
  };
}
