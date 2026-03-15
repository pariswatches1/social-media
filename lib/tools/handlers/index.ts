import type { ToolHandler } from "@/lib/tools/types";

// Instagram API tools
import instagramEngagementCalculator from "./instagram-engagement-calculator";
import instagramAudit from "./instagram-audit";
import instagramPostAdvisor from "./instagram-post-advisor";
import instagramReelsAnalyzer from "./instagram-reels-analyzer";
import fakeFollowerChecker from "./fake-follower-checker";
import influencerComparison from "./influencer-comparison";

// Pure AI tools
import aiContentIdeasGenerator from "./ai-content-ideas-generator";
import searchInfluencersByLocation from "./search-influencers-by-location";
import findInfluencersByNiche from "./find-influencers-by-niche";
import trendingHashtagsByCountry from "./trending-hashtags-by-country";
import hashtagGenerator from "./hashtag-generator";
import instagramLookalikeFinder from "./instagram-lookalike-finder";
import influencerPricingCalculator from "./influencer-pricing-calculator";

// YouTube AI tools
import youtubeSearchByNiche from "./youtube-search-by-niche";
import youtubeLookalikeFinder from "./youtube-lookalike-finder";
import youtubeSearchByLocation from "./youtube-search-by-location";
import youtubeChannelQualityChecker from "./youtube-channel-quality-checker";
import youtubeEngagementCalculator from "./youtube-engagement-calculator";
import youtubeChannelsComparison from "./youtube-channels-comparison";
import youtubeSubscriberCountChecker from "./youtube-subscriber-count-checker";

export const TOOL_HANDLERS: Record<string, ToolHandler> = {
  // Instagram API tools
  "instagram-engagement-calculator": instagramEngagementCalculator,
  "instagram-audit": instagramAudit,
  "instagram-post-advisor": instagramPostAdvisor,
  "instagram-reels-analyzer": instagramReelsAnalyzer,
  "fake-follower-checker": fakeFollowerChecker,
  "influencer-comparison": influencerComparison,
  // Pure AI tools
  "ai-content-ideas-generator": aiContentIdeasGenerator,
  "search-influencers-by-location": searchInfluencersByLocation,
  "find-influencers-by-niche": findInfluencersByNiche,
  "trending-hashtags-by-country": trendingHashtagsByCountry,
  "hashtag-generator": hashtagGenerator,
  "instagram-lookalike-finder": instagramLookalikeFinder,
  "influencer-pricing-calculator": influencerPricingCalculator,
  // YouTube AI tools
  "youtube-search-by-niche": youtubeSearchByNiche,
  "youtube-lookalike-finder": youtubeLookalikeFinder,
  "youtube-search-by-location": youtubeSearchByLocation,
  "youtube-channel-quality-checker": youtubeChannelQualityChecker,
  "youtube-engagement-calculator": youtubeEngagementCalculator,
  "youtube-channels-comparison": youtubeChannelsComparison,
  "youtube-subscriber-count-checker": youtubeSubscriberCountChecker,
};
