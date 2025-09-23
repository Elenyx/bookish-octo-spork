import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ShipCard from "@/components/ShipCard";
import StatBar from "@/components/StatBar";
import { gameApi } from "@/lib/gameApi";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Rocket, Zap, Package, Shield, Radar, Wrench } from "lucide-react";

// Mock Discord ID - in production this would come from Discord OAuth
const MOCK_DISCORD_ID = "mock_discord_user_123";

export default function Fleet() {
  const { toast } = useToast();

  const { data: user } = useQuery({
    queryKey: ['/api/user', MOCK_DISCORD_ID],
    queryFn: () => gameApi.getUser(MOCK_DISCORD_ID),
    retry: false
  });

  const { data: ships = [], isLoading } = useQuery({
    queryKey: ['/api/user', user?.id, 'ships'],
    queryFn: () => gameApi.getUserShips(user!.id),
    enabled: !!user?.id,
    retry: false
  });

  const activateShipMutation = useMutation({
    mutationFn: (shipId: string) => gameApi.activateShip(user!.id, shipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({ title: "Ship activated successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to activate ship", variant: "destructive" });
    }
  });

  const upgradeShipMutation = useMutation({
    mutationFn: (shipId: string) => gameApi.upgradeShip(user!.id, shipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({ title: "Ship upgraded successfully!" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Upgrade failed", 
        description: error.message || "Check resources and requirements",
        variant: "destructive" 
      });
    }
  });

  const activeShip = ships.find(ship => ship.isActive);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading fleet data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-orbitron font-bold text-primary glow-text">
          Fleet Command
        </h1>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Credits</div>
            <div className="font-mono font-bold text-accent" data-testid="text-user-credits">
              {user?.credits?.toLocaleString() || 0}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Nexium</div>
            <div className="font-mono font-bold text-secondary" data-testid="text-user-nexium">
              {user?.nexium || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Active Ship Status */}
      {activeShip && (
        <Card className="mb-8 glow-border">
          <CardHeader>
            <CardTitle className="text-primary">
              <Rocket className="h-5 w-5 inline mr-2" />
              Active Ship Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-orbitron font-bold text-xl mb-2" data-testid="text-active-ship-name">
                  {activeShip.variant}
                </h3>
                <p className="text-muted-foreground mb-4" data-testid="text-active-ship-type">
                  {activeShip.type} - Tier {activeShip.tier}
                </p>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Health</span>
                      <span className="font-mono" data-testid="text-ship-health">
                        {activeShip.health}/{activeShip.maxHealth}
                      </span>
                    </div>
                    <StatBar 
                      value={activeShip.health} 
                      max={activeShip.maxHealth} 
                      className="h-2"
                    />
                  </div>
                  
                  {activeShip.health < activeShip.maxHealth && (
                    <Button size="sm" variant="outline" data-testid="button-repair-ship">
                      <Wrench className="h-4 w-4 mr-2" />
                      Repair Ship
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <Zap className="h-4 w-4 mr-2 text-secondary" />
                  <div>
                    <div className="text-muted-foreground">Speed</div>
                    <div className="font-mono" data-testid="text-ship-speed">{activeShip.speed}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Package className="h-4 w-4 mr-2 text-accent" />
                  <div>
                    <div className="text-muted-foreground">Cargo</div>
                    <div className="font-mono" data-testid="text-ship-cargo">{activeShip.cargo}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-destructive" />
                  <div>
                    <div className="text-muted-foreground">Weapons</div>
                    <div className="font-mono" data-testid="text-ship-weapons">{activeShip.weapons}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Radar className="h-4 w-4 mr-2 text-primary" />
                  <div>
                    <div className="text-muted-foreground">Sensors</div>
                    <div className="font-mono" data-testid="text-ship-sensors">{activeShip.sensors}</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fleet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ships.map(ship => (
          <div key={ship.id} className="relative">
            <ShipCard ship={ship} />
            <div className="mt-4 flex space-x-2">
              <Button
                className="flex-1"
                variant={ship.isActive ? "secondary" : "default"}
                disabled={ship.isActive || activateShipMutation.isPending}
                onClick={() => activateShipMutation.mutate(ship.id)}
                data-testid={`button-activate-${ship.id}`}
              >
                {ship.isActive ? "Active" : "Activate"}
              </Button>
              
              {ship.tier < 4 && (
                <Button
                  variant="outline"
                  disabled={upgradeShipMutation.isPending}
                  onClick={() => upgradeShipMutation.mutate(ship.id)}
                  data-testid={`button-upgrade-${ship.id}`}
                >
                  <Zap className="h-4 w-4" />
                </Button>
              )}
              
              {ship.tier >= 4 && (
                <Badge variant="secondary" className="px-3 py-1 h-10 flex items-center">
                  MAX
                </Badge>
              )}
            </div>
          </div>
        ))}
        
        {/* Add Ship Card */}
        <Card className="border-dashed border-2 border-muted hover:border-primary transition-colors cursor-pointer">
          <CardContent className="p-6 text-center">
            <Rocket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">Acquire New Ship</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Expand your fleet with specialized vessels
            </p>
            <Button className="w-full" data-testid="button-acquire-new-ship">
              Browse Shipyard
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Ship Type Information */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-primary">Ship Type Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-primary mb-2">Scout</h4>
              <p className="text-muted-foreground">Fast and agile exploration ships. High speed and sensors for sector scanning and resource discovery.</p>
            </div>
            <div>
              <h4 className="font-semibold text-destructive mb-2">Fighter</h4>
              <p className="text-muted-foreground">Combat-focused vessels with heavy armament. Designed for PvP battles and bounty hunting.</p>
            </div>
            <div>
              <h4 className="font-semibold text-accent mb-2">Freighter</h4>
              <p className="text-muted-foreground">Cargo and trade ships with massive storage capacity. Perfect for resource transportation.</p>
            </div>
            <div>
              <h4 className="font-semibold text-secondary mb-2">Explorer</h4>
              <p className="text-muted-foreground">Long-range discovery ships for deep space exploration and artifact recovery.</p>
            </div>
            <div>
              <h4 className="font-semibold text-orange-500 mb-2">Battlecruiser</h4>
              <p className="text-muted-foreground">Heavy combat ships for large-scale raids and defensive operations.</p>
            </div>
            <div>
              <h4 className="font-semibold text-purple-500 mb-2">Flagship</h4>
              <p className="text-muted-foreground">Command vessels for fleet leadership and diplomatic missions.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
