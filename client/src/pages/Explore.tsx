import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { gameApi } from "@/lib/gameApi";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Map, Crosshair, Fish, Gem, Zap, Clock, Award } from "lucide-react";

// Mock Discord ID - in production this would come from Discord OAuth
const MOCK_DISCORD_ID = "mock_discord_user_123";

export default function Explore() {
  const [selectedExplorationType, setSelectedExplorationType] = useState<string>("");
  const { toast } = useToast();

  const { data: user } = useQuery({
    queryKey: ['/api/user', MOCK_DISCORD_ID],
    queryFn: () => gameApi.getUser(MOCK_DISCORD_ID),
    retry: false
  });

  const { data: ships = [] } = useQuery({
    queryKey: ['/api/user', user?.id, 'ships'],
    queryFn: () => gameApi.getUserShips(user!.id),
    enabled: !!user?.id,
    retry: false
  });

  const { data: explorations = [], isLoading: explorationsLoading } = useQuery({
    queryKey: ['/api/user', user?.id, 'explorations'],
    queryFn: () => gameApi.getUserExplorations(user!.id),
    enabled: !!user?.id,
    retry: false
  });

  const exploreMutation = useMutation({
    mutationFn: (type: string) => gameApi.explore(user!.id, type),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      const rewards = data.result?.rewards || [];
      const rewardText = rewards.map(r => `${r.name} x${r.quantity}`).join(', ');
      
      toast({
        title: "Exploration Complete!",
        description: `Rewards: ${rewardText || 'Experience gained'}`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Exploration Failed",
        description: error.message || "Try again later",
        variant: "destructive"
      });
    }
  });

  const activeShip = ships.find(ship => ship.isActive);

  const explorationTypes = [
    {
      id: 'exploration',
      name: 'Sector Scan',
      icon: Map,
      description: 'Comprehensive sector analysis and mapping',
      color: 'text-primary'
    },
    {
      id: 'hunting',
      name: 'Resource Hunt',
      icon: Crosshair,
      description: 'Target valuable resources and materials',
      color: 'text-destructive'
    },
    {
      id: 'artifact_search',
      name: 'Artifact Search',
      icon: Gem,
      description: 'Search for ancient artifacts and technology',
      color: 'text-accent'
    },
    {
      id: 'fishing',
      name: 'Deep Space Fishing',
      icon: Fish,
      description: 'Harvest exotic space-dwelling creatures',
      color: 'text-secondary'
    }
  ];

  const handleExplore = () => {
    if (!selectedExplorationType) {
      toast({
        title: "Select exploration type",
        description: "Choose what type of exploration to perform",
        variant: "destructive"
      });
      return;
    }
    exploreMutation.mutate(selectedExplorationType);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-orbitron font-bold text-primary glow-text">
          Deep Space Exploration
        </h1>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Exploration Level</div>
            <div className="font-mono font-bold text-primary" data-testid="text-exploration-level">
              {user?.stats?.exploration || 0}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Active Ship</div>
            <div className="font-mono font-bold text-secondary" data-testid="text-active-ship">
              {activeShip?.variant || 'None'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Exploration Control Panel */}
        <div className="space-y-6">
          <Card className="glow-border">
            <CardHeader>
              <CardTitle className="text-primary">
                <Map className="h-5 w-5 inline mr-2" />
                Mission Control
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!activeShip ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No active ship selected</p>
                  <p className="text-sm">Visit Fleet Management to activate a ship</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">
                      Exploration Type
                    </label>
                    <Select value={selectedExplorationType} onValueChange={setSelectedExplorationType}>
                      <SelectTrigger data-testid="select-exploration-type">
                        <SelectValue placeholder="Select exploration mission" />
                      </SelectTrigger>
                      <SelectContent>
                        {explorationTypes.map(type => {
                          const Icon = type.icon;
                          return (
                            <SelectItem key={type.id} value={type.id}>
                              <div className="flex items-center">
                                <Icon className={`h-4 w-4 mr-2 ${type.color}`} />
                                {type.name}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedExplorationType && (
                    <div className="bg-muted rounded-lg p-4">
                      {(() => {
                        const type = explorationTypes.find(t => t.id === selectedExplorationType);
                        const Icon = type?.icon || Map;
                        return (
                          <div>
                            <div className="flex items-center mb-2">
                              <Icon className={`h-5 w-5 mr-2 ${type?.color}`} />
                              <h4 className="font-semibold">{type?.name}</h4>
                            </div>
                            <p className="text-sm text-muted-foreground">{type?.description}</p>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  <Button 
                    className="w-full" 
                    size="lg"
                    disabled={!selectedExplorationType || exploreMutation.isPending}
                    onClick={handleExplore}
                    data-testid="button-start-exploration"
                  >
                    {exploreMutation.isPending ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Exploring...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Begin Exploration
                      </>
                    )}
                  </Button>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-muted-foreground">Ship Sensors:</span>
                      <span className="font-mono ml-1 text-primary" data-testid="text-ship-sensors">
                        {activeShip.sensors}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Success Rate:</span>
                      <span className="font-mono ml-1 text-accent">
                        ~{Math.min(95, 60 + activeShip.sensors * 0.3).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Exploration Types Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">Exploration Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {explorationTypes.map(type => {
                  const Icon = type.icon;
                  return (
                    <div key={type.id} className="flex items-start space-x-3 p-3 bg-muted rounded-lg">
                      <Icon className={`h-5 w-5 mt-0.5 ${type.color}`} />
                      <div>
                        <h4 className="font-semibold text-foreground">{type.name}</h4>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Exploration History */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">
                <Award className="h-5 w-5 inline mr-2" />
                Recent Expeditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {explorationsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading exploration history...</p>
                </div>
              ) : explorations.length > 0 ? (
                <div className="space-y-4">
                  {explorations.map((exploration, index) => (
                    <div key={exploration.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={exploration.result?.success ? "default" : "secondary"}
                            className={exploration.result?.success ? "bg-green-600" : ""}
                          >
                            {exploration.result?.success ? "Success" : "Partial"}
                          </Badge>
                          <span className="text-sm font-medium" data-testid={`text-exploration-type-${index}`}>
                            {exploration.type.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground" data-testid={`text-exploration-sector-${index}`}>
                          {exploration.sector}
                        </span>
                      </div>
                      
                      {exploration.result?.rewards && exploration.result.rewards.length > 0 && (
                        <div className="space-y-1">
                          <h5 className="text-xs font-medium text-muted-foreground">Rewards:</h5>
                          <div className="flex flex-wrap gap-1">
                            {exploration.result.rewards.map((reward, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs" data-testid={`badge-reward-${index}-${idx}`}>
                                {reward.name} x{reward.quantity}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                        <span>Experience: +{exploration.result?.experience || 0}</span>
                        <span>{new Date(exploration.timestamp || '').toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Map className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No explorations yet</p>
                  <p className="text-sm text-muted-foreground">Start your first expedition to map the unknown!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Sector Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">Current Sector: Nexus-Alpha-7</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-48 bg-muted rounded-lg overflow-hidden mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1502134249126-9f3755a50d78?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=300" 
                  alt="Current sector view" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent"></div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Difficulty:</span>
                  <span className="ml-2 font-mono text-accent">Level 3</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Hostiles:</span>
                  <span className="ml-2 font-mono text-destructive">Moderate</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Resources:</span>
                  <span className="ml-2 font-mono text-secondary">Rich</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Phenomena:</span>
                  <span className="ml-2 font-mono text-primary">Ion Storms</span>
                </div>
              </div>
              
              <Button variant="outline" className="w-full mt-4" data-testid="button-change-sector">
                <Map className="h-4 w-4 mr-2" />
                Change Sector
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
