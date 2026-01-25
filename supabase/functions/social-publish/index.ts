import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "node:crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Platform adapter interfaces
interface PublishResult {
  success: boolean;
  platformPostId?: string;
  platformUrl?: string;
  error?: string;
}

interface PostData {
  id: string;
  platform: string;
  content: string;
  media_urls: string[];
  hashtags: string[];
  account_id: string;
}

// Twitter/X API v2 Publisher
async function publishToTwitter(post: PostData): Promise<PublishResult> {
  const API_KEY = Deno.env.get("TWITTER_CONSUMER_KEY")?.trim();
  const API_SECRET = Deno.env.get("TWITTER_CONSUMER_SECRET")?.trim();
  const ACCESS_TOKEN = Deno.env.get("TWITTER_ACCESS_TOKEN")?.trim();
  const ACCESS_TOKEN_SECRET = Deno.env.get("TWITTER_ACCESS_TOKEN_SECRET")?.trim();

  if (!API_KEY || !API_SECRET || !ACCESS_TOKEN || !ACCESS_TOKEN_SECRET) {
    return { success: false, error: "Twitter API credentials not configured" };
  }

  try {
    // Build tweet text with hashtags
    let tweetText = post.content;
    if (post.hashtags && post.hashtags.length > 0) {
      tweetText += "\n\n" + post.hashtags.map(h => h.startsWith('#') ? h : `#${h}`).join(" ");
    }

    // Truncate to Twitter limit (280 chars)
    if (tweetText.length > 280) {
      tweetText = tweetText.substring(0, 277) + "...";
    }

    const url = "https://api.x.com/2/tweets";
    const method = "POST";
    const oauthHeader = generateOAuthHeader(method, url, API_KEY, API_SECRET, ACCESS_TOKEN, ACCESS_TOKEN_SECRET);

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: oauthHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: tweetText }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      return { success: false, error: responseData.detail || responseData.title || "Twitter API error" };
    }

    return {
      success: true,
      platformPostId: responseData.data?.id,
      platformUrl: `https://twitter.com/i/web/status/${responseData.data?.id}`,
    };
  } catch (error: unknown) {
    console.error("Twitter publish error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

// LinkedIn API Publisher
async function publishToLinkedIn(post: PostData): Promise<PublishResult> {
  const CLIENT_ID = Deno.env.get("LINKEDIN_CLIENT_ID");
  const CLIENT_SECRET = Deno.env.get("LINKEDIN_CLIENT_SECRET");

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return { success: false, error: "LinkedIn API credentials not configured" };
  }

  // Note: LinkedIn requires OAuth2 user token flow - placeholder for actual implementation
  return { 
    success: false, 
    error: "LinkedIn publishing requires OAuth2 user authorization. Configure in platform settings." 
  };
}

// Meta (Instagram/Facebook) Publisher
async function publishToMeta(post: PostData, platform: 'instagram' | 'facebook'): Promise<PublishResult> {
  const APP_ID = Deno.env.get("META_APP_ID");
  const APP_SECRET = Deno.env.get("META_APP_SECRET");

  if (!APP_ID || !APP_SECRET) {
    return { success: false, error: "Meta API credentials not configured" };
  }

  // Note: Meta requires page/business account tokens - placeholder for actual implementation
  return { 
    success: false, 
    error: `${platform} publishing requires page access token. Configure in platform settings.` 
  };
}

// Reddit API Publisher
async function publishToReddit(post: PostData): Promise<PublishResult> {
  const CLIENT_ID = Deno.env.get("REDDIT_CLIENT_ID");
  const CLIENT_SECRET = Deno.env.get("REDDIT_CLIENT_SECRET");

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return { success: false, error: "Reddit API credentials not configured" };
  }

  // Note: Reddit requires user OAuth - placeholder for actual implementation
  return { 
    success: false, 
    error: "Reddit publishing requires user authorization. Configure in platform settings." 
  };
}

// OAuth 1.0a signature generation for Twitter
function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): string {
  const signatureBaseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(
    Object.entries(params)
      .sort()
      .map(([k, v]) => `${k}=${v}`)
      .join("&")
  )}`;
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;
  const hmacSha1 = createHmac("sha1", signingKey);
  return hmacSha1.update(signatureBaseString).digest("base64");
}

function generateOAuthHeader(
  method: string, 
  url: string, 
  apiKey: string, 
  apiSecret: string, 
  accessToken: string, 
  accessTokenSecret: string
): string {
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: apiKey,
    oauth_nonce: Math.random().toString(36).substring(2),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: "1.0",
  };

  const signature = generateOAuthSignature(method, url, oauthParams, apiSecret, accessTokenSecret);

  const signedOAuthParams = {
    ...oauthParams,
    oauth_signature: signature,
  };

  return "OAuth " + Object.entries(signedOAuthParams)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
    .join(", ");
}

// Main platform router
async function publishToplatform(post: PostData): Promise<PublishResult> {
  switch (post.platform) {
    case "twitter":
      return publishToTwitter(post);
    case "linkedin":
      return publishToLinkedIn(post);
    case "instagram":
      return publishToMeta(post, "instagram");
    case "facebook":
      return publishToMeta(post, "facebook");
    case "reddit":
      return publishToReddit(post);
    case "threads":
      return publishToMeta(post, "instagram"); // Threads uses Meta API
    default:
      return { success: false, error: `Unsupported platform: ${post.platform}` };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { postId, postIds } = await req.json();

    // Handle single post or batch
    const idsToProcess = postIds || (postId ? [postId] : []);
    
    if (idsToProcess.length === 0) {
      return new Response(
        JSON.stringify({ error: "No post IDs provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: Array<{ postId: string; result: PublishResult }> = [];

    for (const id of idsToProcess) {
      // Fetch post details
      const { data: post, error: fetchError } = await supabase
        .from("social_advertising_posts")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError || !post) {
        results.push({ postId: id, result: { success: false, error: "Post not found" } });
        continue;
      }

      // Update status to publishing
      await supabase
        .from("social_advertising_posts")
        .update({ status: "publishing" })
        .eq("id", id);

      // Attempt to publish
      const publishResult = await publishToplatform(post as PostData);

      // Update post with result
      const updateData: Record<string, unknown> = {
        status: publishResult.success ? "published" : "failed",
        error_message: publishResult.error || null,
        retry_count: (post.retry_count || 0) + (publishResult.success ? 0 : 1),
      };

      if (publishResult.success) {
        updateData.published_at = new Date().toISOString();
        updateData.platform_post_id = publishResult.platformPostId;
        updateData.platform_url = publishResult.platformUrl;
      }

      await supabase
        .from("social_advertising_posts")
        .update(updateData)
        .eq("id", id);

      results.push({ postId: id, result: publishResult });

      console.log(`Published post ${id} to ${post.platform}: ${publishResult.success ? "SUCCESS" : "FAILED"}`);
    }

    const successCount = results.filter(r => r.result.success).length;
    const failCount = results.length - successCount;

    return new Response(
      JSON.stringify({
        message: `Processed ${results.length} posts: ${successCount} succeeded, ${failCount} failed`,
        results,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Social publish error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
