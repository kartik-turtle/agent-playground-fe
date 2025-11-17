import { useState } from "react";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card } from "./ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";

interface ProfileConfigProps {
  userProfile: string;
  onUserProfileChange: (profile: string) => void;
  agentProfile: string;
  onAgentProfileChange: (profile: string) => void;
}

export function ProfileConfig({
  userProfile,
  onUserProfileChange,
  agentProfile,
  onAgentProfileChange,
}: ProfileConfigProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("user");
  const [userProfileError, setUserProfileError] = useState<string | null>(null);
  const [agentProfileError, setAgentProfileError] = useState<string | null>(null);

  const validateJSON = (value: string): boolean => {
    if (!value.trim()) {
      return true;
    }
    try {
      JSON.parse(value);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleUserProfileChange = (value: string) => {
    onUserProfileChange(value);
    if (value.trim() && !validateJSON(value)) {
      setUserProfileError("Invalid JSON format");
    } else {
      setUserProfileError(null);
    }
  };

  const handleAgentProfileChange = (value: string) => {
    onAgentProfileChange(value);
    if (value.trim() && !validateJSON(value)) {
      setAgentProfileError("Invalid JSON format");
    } else {
      setAgentProfileError(null);
    }
  };

  const formatJSON = (value: string): string => {
    try {
      const parsed = JSON.parse(value);
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      return value;
    }
  };

  return (
    <Card className="border-zinc-200 shadow-none rounded-none border-b">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger className="w-full px-4 py-3 text-sm text-zinc-600 hover:text-zinc-900 flex items-center justify-between">
          <span>Profile Configuration</span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Tabs defaultValue="user" className="w-full">
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 pt-3">
              <TabsList className="bg-transparent border-0 p-0 h-auto">
                <TabsTrigger
                  value="user"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-zinc-900 rounded-none pb-2 px-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">User Profile</span>
                    {userProfile.trim() && !userProfileError && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    )}
                    {userProfileError && (
                      <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                    )}
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="agent"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-zinc-900 rounded-none pb-2 px-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Agent Profile</span>
                    {agentProfile.trim() && !agentProfileError && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    )}
                    {agentProfileError && (
                      <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                    )}
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="user" className="p-4 space-y-2 m-0">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-zinc-600">JSON Configuration</Label>
                {userProfile.trim() && !userProfileError && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-zinc-600 hover:text-zinc-900"
                    onClick={() => {
                      const formatted = formatJSON(userProfile);
                      onUserProfileChange(formatted);
                    }}
                  >
                    Format JSON
                  </Button>
                )}
              </div>
              <Textarea
                value={userProfile}
                onChange={(e) => handleUserProfileChange(e.target.value)}
                placeholder='{\n  "name": "User Name",\n  "role": "Role"\n}'
                className="min-h-[100px] font-mono text-xs border-zinc-200 focus-visible:ring-zinc-300 resize-none"
              />
              {userProfileError && (
                <div className="flex items-center gap-2 text-xs text-red-500">
                  <AlertCircle className="h-3 w-3" />
                  <span>{userProfileError}</span>
                </div>
              )}
            </TabsContent>

            <TabsContent value="agent" className="p-4 space-y-2 m-0">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-zinc-600">JSON Configuration</Label>
                {agentProfile.trim() && !agentProfileError && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-zinc-600 hover:text-zinc-900"
                    onClick={() => {
                      const formatted = formatJSON(agentProfile);
                      onAgentProfileChange(formatted);
                    }}
                  >
                    Format JSON
                  </Button>
                )}
              </div>
              <Textarea
                value={agentProfile}
                onChange={(e) => handleAgentProfileChange(e.target.value)}
                placeholder='{\n  "personality": "professional",\n  "tone": "friendly"\n}'
                className="min-h-[100px] font-mono text-xs border-zinc-200 focus-visible:ring-zinc-300 resize-none"
              />
              {agentProfileError && (
                <div className="flex items-center gap-2 text-xs text-red-500">
                  <AlertCircle className="h-3 w-3" />
                  <span>{agentProfileError}</span>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}