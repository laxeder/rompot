export interface StatusOptions {
  recording: string;
  reading: string;
  offline: string;
  typing: string;
  online: string;
}

export type StatusTypes = keyof StatusOptions;
