import { useQuery } from "@tanstack/react-query";
import PlayerStatus from "@/components/PlayerStatus";
import ShipCard from "@/components/ShipCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { gameApi } from "@/lib/gameApi";
import { Rocket, Map, Users, Store, Crosshair, Fish, Gem, TrendingUp } from "lucide-react";

// Mock Discord ID - in production this would come from Discord OAuth
const MOCK_DISCORD_ID = "mock_discord_user_123";

export default function Dashboard() {
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['/api/user', MOCK_DISCORD_ID],
    queryFn: () => gameApi.getUser(MOCK_DISCORD_ID),
    retry: false
  });

  const { data: ships = [], isLoading: shipsLoading } = useQuery({
    queryKey: ['/api/user', user?.id, 'ships'],
    queryFn: () => gameApi.getUserShips(user!.id),
    enabled: !!user?.id,
    retry: false
  });

  const { data: explorations = [] } = useQuery({
    queryKey: ['/api/user', user?.id, 'explorations'],
    queryFn: () => gameApi.getUserExplorations(user!.id),
    enabled: !!user?.id,
    retry: false
  });

  const { data: marketItems = [] } = useQuery({
    queryKey: ['/api/market/items'],
    queryFn: gameApi.getMarketItems,
    retry: false
  });

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading commander profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center font-orbitron">
              <Rocket className="h-8 w-8 mx-auto mb-2 text-primary" />
              Welcome to Stellar Nexus
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              You need to register to start your space exploration journey.
            </p>
            <Button 
              onClick={() => gameApi.registerUser(MOCK_DISCORD_ID, "TestCommander")}
              className="w-full"
              data-testid="button-register"
            >
              Begin Your Journey
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeShip = ships.find(ship => ship.isActive);

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Player Status */}
      <section className="mb-8">
        <PlayerStatus user={user} activeShip={activeShip} />
      </section>

      {/* Fleet Management */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-orbitron font-bold text-primary glow-text">
            Fleet Management
          </h2>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-acquire-ship">
            <Rocket className="h-4 w-4 mr-2" />
            Acquire Ship
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shipsLoading ? (
            <div className="col-span-full text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading fleet...</p>
            </div>
          ) : (
            ships.map(ship => (
              <ShipCard key={ship.id} ship={ship} />
            ))
          )}
        </div>
      </section>

      {/* Exploration Hub */}
      <section className="mb-8">
        <h2 className="text-2xl font-orbitron font-bold text-primary glow-text mb-6">
          Exploration Hub
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glow-border">
            <CardHeader>
              <CardTitle className="text-primary">
                <Map className="h-5 w-5 inline mr-2" />
                Galaxy Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-64 bg-muted rounded-lg overflow-hidden mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1502134249126-9f3755a50d78?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400" 
                  alt="Galaxy exploration map" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card/50"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Current Sector: Nexus-Alpha-7</span>
                    <Button size="sm" data-testid="button-jump-sector">
                      Jump
                    </Button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90" data-testid="button-explore-sector">
                  <Map className="h-4 w-4 mr-2" />
                  Explore Sector
                </Button>
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90" data-testid="button-hunt-resources">
                  <Crosshair className="h-4 w-4 mr-2" />
                  Hunt Resources
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-primary">
                  <Gem className="h-5 w-5 inline mr-2" />
                  Recent Discoveries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {explorations.slice(0, 3).map((exploration, index) => (
                    <div key={exploration.id} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div>
                        <div className="font-medium text-foreground">
                          {exploration.result?.rewards?.[0]?.name || 'Unknown Discovery'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Sector {exploration.sector}
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-accent">
                        +{exploration.result?.rewards?.[0]?.value || 0} Credits
                      </Badge>
                    </div>
                  ))}
                  {explorations.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      No explorations yet. Start exploring to discover new sectors!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-primary">
                  <Fish className="h-5 w-5 inline mr-2" />
                  Fishing Grounds
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <img 
                  src="https://images.unsplash.com/photo-1583212292454-1fe6229603b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200" 
                  alt="Alien fishing grounds" 
                  className="rounded-lg w-full h-24 object-cover mb-3"
                />
                <Button className="w-full" data-testid="button-start-fishing">
                  <Fish className="h-4 w-4 mr-2" />
                  Cast Line
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Combat and Market */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">
              <Crosshair className="h-5 w-5 inline mr-2" />
              Combat Arena
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-bold mb-2">PvE Missions</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Asteroid Miners</span>
                    <Button size="sm" className="bg-primary text-primary-foreground" data-testid="button-engage-miners">
                      Engage
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Rogue Fleet</span>
                    <Button size="sm" variant="destructive" data-testid="button-challenge-fleet">
                      Challenge
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-bold mb-2">PvP Battles</h4>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Active Duels</span>
                  <Badge className="bg-accent text-accent-foreground">3</Badge>
                </div>
                <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90" data-testid="button-find-opponent">
                  <Crosshair className="h-4 w-4 mr-2" />
                  Find Opponent
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">
              <Store className="h-5 w-5 inline mr-2" />
              Galactic Market
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-bold mb-3">Trending Items</h4>
                <div className="space-y-2">
                  {marketItems.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm text-foreground">{item.name}</div>
                        <div className="text-xs text-accent">
                          <TrendingUp className="h-3 w-3 inline mr-1" />
                          Market Active
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-accent">{item.price.toLocaleString()} ₡</div>
                        <Button size="sm" className="text-xs" data-testid={`button-buy-${item.name.toLowerCase().replace(' ', '-')}`}>
                          Buy
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90" data-testid="button-npc-shop">
                  NPC Shop
                </Button>
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90" data-testid="button-crafting-menu">
                  Crafting
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
