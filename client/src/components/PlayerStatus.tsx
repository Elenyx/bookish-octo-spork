import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StatBar from "@/components/StatBar";
import { User, Ship } from "@shared/schema";
import { TrendingUp, Zap, Award, ShoppingCart } from "lucide-react";

interface PlayerStatusProps {
  user: User;
  activeShip?: Ship;
}

export default function PlayerStatus({ user, activeShip }: PlayerStatusProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="glow-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-orbitron font-bold text-primary">
                Commander Profile
              </CardTitle>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Level</span>
                <Badge className="text-xl font-bold bg-accent text-accent-foreground" data-testid="badge-user-level">
                  {user.level}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary" data-testid="text-exploration-stat">
                  {user.stats?.exploration || 0}
                </div>
                <div className="text-sm text-muted-foreground">Sectors Explored</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive" data-testid="text-combat-stat">
                  {user.stats?.combat || 0}
                </div>
                <div className="text-sm text-muted-foreground">Battles Won</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent" data-testid="text-artifacts-stat">
                  {user.stats?.artifacts || 0}
                </div>
                <div className="text-sm text-muted-foreground">Artifacts Found</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary" data-testid="text-trades-stat">
                  {user.stats?.trades || 0}
                </div>
                <div className="text-sm text-muted-foreground">Trades Made</div>
              </div>
            </div>
            
            {/* Experience Progress */}
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Experience</span>
                <span className="font-mono text-foreground" data-testid="text-user-experience">
                  {user.experience || 0}/{(user.level || 1) * 1000}
                </span>
              </div>
              <StatBar 
                value={(user.experience || 0) % 1000} 
                max={1000} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-6">
        {/* Resource Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-orbitron font-bold text-primary">
              Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-accent" />
                  <span className="text-sm text-muted-foreground">Credits</span>
                </div>
                <span className="font-mono font-bold text-accent text-lg" data-testid="text-user-credits">
                  {(user.credits || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-secondary" />
                  <span className="text-sm text-muted-foreground">Nexium</span>
                </div>
                <span className="font-mono font-bold text-secondary text-lg" data-testid="text-user-nexium">
                  {user.nexium}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Ship */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-orbitron font-bold text-primary">
              Active Ship
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeShip ? (
              <div className="text-center">
                <img 
                  src="https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" 
                  alt="Active spaceship" 
                  className="rounded-lg w-full h-32 object-cover mb-4"
                />
                <h4 className="font-orbitron font-bold text-lg text-foreground" data-testid="text-active-ship-name">
                  {activeShip.variant}
                </h4>
                <p className="text-muted-foreground text-sm" data-testid="text-active-ship-details">
                  {activeShip.type} - Tier {activeShip.tier}
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Health</span>
                    <span className="font-mono" data-testid="text-active-ship-health">
                      {activeShip.health}/{activeShip.maxHealth}
                    </span>
                  </div>
                  <StatBar 
                    value={activeShip.health} 
                    max={activeShip.maxHealth} 
                    className="h-2"
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No active ship</p>
                <p className="text-sm text-muted-foreground">Visit Fleet to select a ship</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
