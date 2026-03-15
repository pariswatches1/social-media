export interface ToolInput {
  handle?: string;
  handle1?: string;
  handle2?: string;
  username?: string;
  topic?: string;
  niche?: string;
  location?: string;
  country?: string;
  platform?: string;
  followerCount?: number;
  engagementRate?: number;
  caption?: string;
}

export interface ToolResult {
  success: boolean;
  data: Record<string, unknown>;
  dataSource: "real" | "ai_estimate";
  cached?: boolean;
}

export type ToolHandler = (input: ToolInput) => Promise<ToolResult>;
