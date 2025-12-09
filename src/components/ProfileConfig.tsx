import { useEffect, useMemo, useState } from "react";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { CheckCircle2, AlertCircle, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card } from "./ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { useStore } from "../services/store";
import { debounce, debouncePromise, getItemFromLocalStorage, removeItemFromLocalStorage, setItemToLocalStorage } from "../services/utils";
import apiService from "../services/apiService";
import { APIBase, APIEndpoints, APIMethod } from "../constants/api-endpoints";

export function ProfileConfig() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [userProfileStr, setUserProfileStr] = useState<string>("{}")
  const [agentProfileStr, setAgentProfileStr] = useState<string>("{}")
  const [userProfileError, setUserProfileError] = useState<string | null>(null);
  const [agentProfileError, setAgentProfileError] = useState<string | null>(null);

  const [partnerId, setPartnerId] = useState(getItemFromLocalStorage('partnerId') || "");
  const [authToken, setAuthToken] = useState(getItemFromLocalStorage('authToken') || "");

  const {setPartnerId: setPartnerIdStore, setAuthToken: setAuthTokenStore, setPartnerDetails, setUserProfile, setAgentProfile, setUpdatePending, userProfile, agentProfile} = useStore()

  const partnerDetailsApi = useMemo(() => debouncePromise(apiService, 1500), [])
  console.log("profile render")
  
  useEffect(() => {
    let cancelled = false
    setPartnerIdStore(partnerId)
    setAuthTokenStore(authToken)
    setItemToLocalStorage('partnerId', partnerId)
    setItemToLocalStorage('authToken', authToken)
    if (authToken && authToken.trim().length !=0 && partnerId && partnerId.trim().length != 0) {
        const promise = partnerDetailsApi(APIMethod.GET, APIBase.MINTPRO, APIEndpoints.PARTNER_DETAILS_API + partnerId, {}, {}, {'tenant': 'turtlemint', 'broker': 'turtlemint'})
        promise.then(data => {
          if (!cancelled) {
              setPartnerDetails(data.data)
          }
        })
    }
    return () => {
      if (!cancelled) {
        cancelled = true
      }
    }
  }, [partnerId, authToken])

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

  const updatePending = useMemo(() => debounce(setUpdatePending, 1500), [])

  const handleUserProfileChange = (value: string) => {
    setUserProfileStr(value)
    if (value.trim() && !validateJSON(value)) {
      setUserProfileError("Invalid JSON format");
    } else {
      setUserProfile(JSON.parse(value));
      updatePending(true)
      setUserProfileError(null);
    }
  };

  const handleAgentProfileChange = (value: string) => {
    setAgentProfileStr(value)
    if (value.trim() && !validateJSON(value)) {
      setAgentProfileError("Invalid JSON format");
    } else {
      setAgentProfile(JSON.parse(value));
      updatePending(true)
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

  const handleClearSession = () => {
    removeItemFromLocalStorage('sessionId')
    window.location.reload()
  }

  useEffect(() => {
    if (userProfile) {
        const state = JSON.parse(userProfileStr)
        if (JSON.stringify(state) !== JSON.stringify(userProfile)) {
           setUserProfileStr(JSON.stringify(userProfile))
        }
    }
  }, [userProfile])

  useEffect(() => {
     if (agentProfile) {
        const state = JSON.parse(agentProfileStr)
        if (JSON.stringify(state) !== JSON.stringify(agentProfile)) {
           setAgentProfileStr(JSON.stringify(agentProfile))
        }
    }
  }, [agentProfile])

  return (
    <Card className="border-zinc-200 shadow-none rounded-none border-b">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <div className="w-full px-4 py-3 flex items-center justify-between">
          <CollapsibleTrigger className="text-sm text-zinc-600 hover:text-zinc-900 flex items-center gap-2 flex-1">
            <span>Profile Configuration</span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
          {(
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearSession}
              className="h-8 text-xs gap-2 border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Clear Session
            </Button>
          )}
        </div>
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
                    {userProfileStr.trim() && !userProfileError && (
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
                    {agentProfileStr.trim() && !agentProfileError && (
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
                {userProfileStr.trim() && !userProfileError && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-zinc-600 hover:text-zinc-900"
                    onClick={() => {
                      const formatted = formatJSON(userProfileStr);
                      setUserProfileStr(formatted)
                      setUserProfile(JSON.parse(formatted));
                      updatePending(true)
                    }}
                  >
                    Format JSON
                  </Button>
                )}
              </div>
              <Textarea
                value={userProfileStr}
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
                {agentProfileStr.trim() && !agentProfileError && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-zinc-600 hover:text-zinc-900"
                    onClick={() => {
                      const formatted = formatJSON(agentProfileStr);
                      setAgentProfileStr(formatted)
                      setAgentProfile(JSON.parse(formatted));
                      updatePending(true)
                    }}
                  >
                    Format JSON
                  </Button>
                )}
              </div>
              <Textarea
                value={agentProfileStr}
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
          {(
            <div className="p-4 space-y-2 m-0 border-t border-zinc-200">
              <Label className="text-xs text-zinc-600">Auth Token</Label>
              <Input
                value={authToken}
                onChange={(e) => setAuthToken(e.target.value)}
                placeholder="Enter auth token"
                className="font-mono text-xs border-zinc-200 focus-visible:ring-zinc-300"
              />
            </div>
          )}
          {(
            <div className="p-4 space-y-2 m-0 border-t border-zinc-200">
              <Label className="text-xs text-zinc-600">Partner ID</Label>
              <Input
                value={partnerId}
                onChange={(e) => setPartnerId(e.target.value)}
                placeholder="Enter partner ID"
                className="font-mono text-xs border-zinc-200 focus-visible:ring-zinc-300"
              />
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}