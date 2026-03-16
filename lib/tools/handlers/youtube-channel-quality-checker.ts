import { callClaude } from "@/lib/anthropic";
import { fetchYouTubeChannelData, formatCount, engagementRating, subscriberTier, hasYouTubeApiKey } from "@/lib/youtube-api";
import type { ToolHandler, ToolResult } from "@/lib/tools/types";

const handler: ToolHandler = async (input): Promise<ToolResult> => {
  const handle = input.handle?.trim();
  if (!handle) {
    return {
      success: false,
      data: { error: "A YouTube channel name or URL is required." },
      dataSource: "ai_estimate",
    };
  }

  // ── Try real YouTube API + AI analysis ───────────────────────────────────
  if (hasYouTubeApiKey()) {
    try {
      const data = await fetchYouTubeChannelData(handle);
      if (data) {
        const { channel, recentVideos, avgViews, avgLikes, avgComments, engagementRate, viewToSubRatio } = data;

        // Calculate quality score based on real metrics
        let qualityScore = 50;

        // Engagement component (0-25 points)
        if (engagementRate >= 8) qualityScore += 25;
        else if (engagementRate >= 4) qualityScore += 20;
        else if (engagementRate >= 2) qualityScore += 15;
        else if (engagementRate >= 1) qualityScore += 10;
        else qualityScore += 5;

        // View-to-sub ratio (0-15 points)
        if (viewToSubRatio >= 30) qualityScore += 15;
        else if (viewToSubRatio >= 15) qualityScore += 12;
        else if (viewToSubRatio >= 5) qualityScore += 8;
        else qualityScore += 3;

        // Consistency (0-10 points)
        if (recentVideos.length >= 5) {
          const viewStdDev = Math.sqrt(
            recentVideos.reduce((sum, v) => sum + Math.pow(v.viewCount - avgViews, 2), 0) / recentVideos.length
          );
          const coefficient = avgViews > 0 ? viewStdDev / avgViews : 1;
          if (coefficient < 0.5) qualityScore += 10;
          else if (coefficient < 1) qualityScore += 7;
          else qualityScore += 3;
        }

        qualityScore = Math.min(100, Math.max(1, qualityScore));

        // Upload frequency
        let uploadFrequency = "Unknown";
        if (recentVideos.length >= 2) {
          const newest = new Date(recentVideos[0].publishedAt).getTime();
          const oldest = new Date(recentVideos[recentVideos.length - 1].publishedAt).getTime();
          const daysBetween = (newest - oldest) / (1000 * 60 * 60 * 24);
          const videosPerWeek = daysBetween > 0 ? (recentVideos.length / daysBetween) * 7 : 0;
          if (videosPerWeek >= 5) uploadFrequency = "Daily or more";
          else if (videosPerWeek >= 3) uploadFrequency = "3-5 videos per week";
          else if (videosPerWeek >= 1.5) uploadFrequency = "2-3 videos per week";
          else if (videosPerWeek >= 0.8) uploadFrequency = "About once per week";
          else if (videosPerWeek >= 0.3) uploadFrequency = "1-2 videos per month";
          else uploadFrequency = "Less than monthly";
        }

        // Growth trajectory
        let growthTrajectory = "Stable";
        if (recentVideos.length >= 4) {
          const firstHalf = recentVideos.slice(Math.floor(recentVideos.length / 2));
          const secondHalf = recentVideos.slice(0, Math.floor(recentVideos.length / 2));
          const avgFirst = firstHalf.reduce((s, v) => s + v.viewCount, 0) / firstHalf.length;
          const avgSecond = secondHalf.reduce((s, v) => s + v.viewCount, 0) / secondHalf.length;
          if (avgSecond > avgFirst * 1.2) growthTrajectory = "Growing — newer videos perform better";
          else if (avgSecond < avgFirst * 0.8) growthTrajectory = "Declining — older videos outperformed recent ones";
          else growthTrajectory = "Stable — consistent view counts";
        }

        // AI improvements based on real data
        let improvements: string[] = [];
        try {
          const aiPrompt = `Based on these real YouTube channel stats, suggest 3 specific improvements:
Channel: ${channel.title}, Subs: ${formatCount(channel.subscriberCount)}, Avg Views: ${formatCount(avgViews)}, Engagement: ${engagementRate}%, Upload: ${uploadFrequency}
Recent titles: ${recentVideos.slice(0, 5).map(v => v.title).join(", ")}
Return ONLY a JSON array of 3 strings.`;
          const aiResponse = await callClaude("You are a YouTube growth strategist. Return ONLY a JSON array.", aiPrompt);
          improvements = JSON.parse(aiResponse.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim());
        } catch {
          improvements = [
            "Optimize video thumbnails and titles for higher click-through rates",
            "Engage more with comments to boost community interaction",
            "Experiment with different content formats to increase engagement",
          ];
        }

        return {
          success: true,
          data: {
            channelName: channel.title,
            handle: channel.customUrl || channel.title,
            qualityScore,
            subscriberCount: channel.subscriberCount,
            estimatedSubscribers: formatCount(channel.subscriberCount),
            subscriberTier: subscriberTier(channel.subscriberCount),
            estimatedTotalViews: formatCount(channel.viewCount),
            totalVideos: channel.videoCount,
            uploadFrequency,
            engagementRate: `${engagementRate}%`,
            engagementRating: engagementRating(engagementRate),
            averageViewsPerVideo: formatCount(avgViews),
            averageLikesPerVideo: formatCount(avgLikes),
            averageCommentsPerVideo: formatCount(avgComments),
            viewToSubscriberRatio: `${viewToSubRatio}%`,
            contentQualityAssessment: `Quality score of ${qualityScore}/100 based on engagement rate (${engagementRate}%), view consistency, and upload frequency (${uploadFrequency}).`,
            audienceEngagementLevel: `${engagementRating(engagementRate)} — ${engagementRate}% engagement rate with ${formatCount(avgComments)} avg comments per video`,
            growthTrajectory,
            improvements,
            thumbnailUrl: channel.thumbnailUrl,
            country: channel.country || "Unknown",
            channelCreated: channel.publishedAt ? new Date(channel.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long" }) : "Unknown",
            videosAnalyzed: recentVideos.length,
          },
          dataSource: "real",
        };
      }
    } catch (error) {
      console.error("[YouTube Quality Checker] API error, falling back to AI:", error);
    }
  }

  // ── AI fallback ──────────────────────────────────────────────────────────
  const systemPrompt = `You are a YouTube analytics expert. Analyze the given YouTube channel. Return ONLY valid JSON:
{
  "channelName": "string", "qualityScore": number (1-100), "estimatedSubscribers": "string",
  "estimatedTotalViews": "string", "uploadFrequency": "string",
  "contentQualityAssessment": "string", "audienceEngagementLevel": "string",
  "growthTrajectory": "string", "improvements": ["string", "string", "string"]
}`;

  const userPrompt = `Analyze the YouTube channel: ${handle}.`;

  try {
    const response = await callClaude(systemPrompt, userPrompt);
    const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return {
      success: true,
      data: { ...parsed, note: "These metrics are AI-estimated. Real-time data was unavailable." },
      dataSource: "ai_estimate",
    };
  } catch (error) {
    return {
      success: false,
      data: { error: "Failed to analyze YouTube channel quality.", details: error instanceof Error ? error.message : "Unknown error" },
      dataSource: "ai_estimate",
    };
  }
};

export default handler;
