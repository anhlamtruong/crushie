"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Heart, Zap, RefreshCw } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

/**
 * Vibe Matching Page
 * Shows users ranked by AI-calculated compatibility score
 */
export default function VibeMatchingPage() {
  const [limit, setLimit] = useState(10);

  const trpc = useTRPC();

  // Use the actual vibeMatch query from your codebase
  const vibeMatchQuery = useQuery(
    trpc.llm.vibeMatch.queryOptions({ limit })
  );

  const getEnergyIcon = (energy: string) => {
    switch (energy) {
      case "high":
      case "chaotic":
        return <Zap className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-blue-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-gray-500";
  };

  const getEnergyColor = (energy: string) => {
    switch (energy) {
      case "chill":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "moderate":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "chaotic":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const isLoading = vibeMatchQuery.isLoading;
  const error = vibeMatchQuery.error;
  const response = vibeMatchQuery.data; // This is the LLMResponse wrapper
  console.log("response is", response, error, isLoading)
  // Extract the actual data from the response
  const matches = response?.data; // The compatibility data array
  const meta = response?.meta; // Meta info (cached, durationMs, etc.)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-2">
          <Heart className="w-8 h-8 text-pink-500" />
          Vibe Matching
        </h1>
        <p className="text-muted-foreground">
          Find your perfect vibe match based on AI-analyzed energy, interests, and style
        </p>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Match Settings</CardTitle>
          <CardDescription>Adjust how many matches you want to see</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Number of matches: {limit}
            </label>
            <input
              type="range"
              min="1"
              max="50"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              style={{
                accentColor: "hsl(var(--primary))",
              }}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>1</span>
              <span>50</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => vibeMatchQuery.refetch()} 
              className="flex-1"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              {isLoading ? "Finding Matches..." : "Refresh Matches"}
            </Button>
          </div>
          {meta?.cached && (
            <p className="text-xs text-muted-foreground">
              ✓ Results cached • Took {meta.durationMs}ms
              {meta.model && ` • Model: ${meta.model}`}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
          <span className="text-muted-foreground">Finding your vibe matches...</span>
          <span className="text-xs text-muted-foreground mt-1">
            Analyzing compatibility with AI
          </span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-red-500">
          <CardContent className="pt-6">
            <p className="text-red-500">Error: {error.message}</p>
            <Button 
              onClick={() => vibeMatchQuery.refetch()} 
              variant="outline" 
              className="mt-4"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {matches && Array.isArray(matches) && matches.length > 0 && (
        <>
          <div className="mb-4 text-sm text-muted-foreground flex items-center justify-between">
            <span>
              Showing {matches.length} matches
            </span>
            {meta?.model && (
              <span className="text-xs">Model: {meta.model}</span>
            )}
          </div>

          <div className="space-y-4">
            {matches.map((match: any, index: number) => (
              <Card key={match.userId || index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl font-bold text-muted-foreground">
                          #{index + 1}
                        </span>
                        <CardTitle className="text-xl">
                          {match.vibeName || match.profile?.vibeName || "Unknown"}
                        </CardTitle>
                        {getEnergyIcon(match.energy || match.profile?.energy)}
                      </div>
                      {(match.vibeSummary || match.profile?.vibeSummary) && (
                        <CardDescription>
                          {match.vibeSummary || match.profile?.vibeSummary}
                        </CardDescription>
                      )}
                    </div>

                    {/* Compatibility Score */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`${getScoreColor(
                          match.score || 0
                        )} text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-xl shadow-lg`}
                      >
                        {Math.round((match.score || 0) * 100)}
                      </div>
                      <span className="text-xs text-muted-foreground mt-1">match</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Energy Level */}
                  <div>
                    <span className="text-sm font-medium">Energy:</span>
                    <Badge className={`ml-2 ${getEnergyColor(match.energy || match.profile?.energy)}`}>
                      {match.energy || match.profile?.energy}
                    </Badge>
                  </div>

                  {/* Interest Tags */}
                  {(match.interestTags || match.profile?.interestTags)?.length > 0 && (
                    <div>
                      <span className="text-sm font-medium block mb-2">Interests:</span>
                      <div className="flex flex-wrap gap-2">
                        {(match.interestTags || match.profile?.interestTags).map((tag: string, i: number) => (
                          <Badge key={i} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Style Tags */}
                  {(match.styleTags || match.profile?.styleTags)?.length > 0 && (
                    <div>
                      <span className="text-sm font-medium block mb-2">Style:</span>
                      <div className="flex flex-wrap gap-2">
                        {(match.styleTags || match.profile?.styleTags).map((tag: string, i: number) => (
                          <Badge key={i} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mood Tags */}
                  {(match.moodTags || match.profile?.moodTags)?.length > 0 && (
                    <div>
                      <span className="text-sm font-medium block mb-2">Mood:</span>
                      <div className="flex flex-wrap gap-2">
                        {(match.moodTags || match.profile?.moodTags).map((tag: string, i: number) => (
                          <Badge key={i} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Narrative */}
                  {match.narrative && (
                    <div className="bg-muted p-4 rounded-lg mt-4 border-l-4 border-primary">
                      <p className="text-sm italic leading-relaxed">
                        &quot;{match.narrative}&quot;
                      </p>
                    </div>
                  )}

                  {/* Common Ground */}
                  {match.commonGround && match.commonGround.length > 0 && (
                    <div>
                      <span className="text-sm font-medium block mb-2">Common Ground:</span>
                      <div className="flex flex-wrap gap-2">
                        {match.commonGround.map((item: string, i: number) => (
                          <Badge key={i} variant="default">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Conversation Starter */}
                  {match.conversationStarter && (
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <p className="text-sm font-medium mb-1">💬 Conversation Starter:</p>
                      <p className="text-sm">{match.conversationStarter}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4">
                    <Button className="flex-1" variant="default">
                      <Heart className="w-4 h-4 mr-2" />
                      Connect
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        // Navigate to detailed profile view
                        console.log("View profile:", match.userId);
                      }}
                    >
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Empty State */}
      {matches && (!Array.isArray(matches) || matches.length === 0) && (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-2">No matches found</p>
            <p className="text-sm text-muted-foreground">
              Try updating your profile or check back later for new users!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}