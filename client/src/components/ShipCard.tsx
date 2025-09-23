import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ship } from "@shared/schema";
import { Zap, Package, Shield, Radar, Heart } from "lucide-react";

interface ShipCardProps {
  ship: Ship;
}

export default function ShipCard({ ship }: ShipCardProps) {
  const getShipTypeColor = (type: string) => {
    const colors = {
      scout: 'text-primary',
      fighter: 'text-destructive',
      freighter: 'text-accent',
      explorer: 'text-secondary',
      battlecruiser: 'text-orange-500',
      flagship: 'text-purple-500'
    };
    return colors[type as keyof typeof colors] || 'text-primary';
  };

  const getTierBadgeVariant = (tier: number) => {
    if (tier >= 4) return 'default';
    if (tier >= 3) return 'secondary';
    return 'outline';
  };

  const getTierLabel = (tier: number) => {
    if (tier >= 4) return 'MAX';
    return `T${tier}`;
  };

  return (
    <Card className={`ship-card transition-all duration-300 hover:border-primary/50 ${ship.isActive ? 'border-primary glow-border' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-orbitron font-bold text-lg text-foreground" data-testid={`text-ship-name-${ship.id}`}>
            {ship.variant}
          </h3>
          <div className="flex items-center space-x-2">
            {ship.isActive && (
              <Badge className="bg-green-600 text-white text-xs">ACTIVE</Badge>
            )}
            <Badge variant={getTierBadgeVariant(ship.tier)} data-testid={`badge-ship-tier-${ship.id}`}>
              {getTierLabel(ship.tier)}
            </Badge>
          </div>
        </div>
        
        <div className={`text-sm text-muted-foreground mb-3 ${getShipTypeColor(ship.type)}`} data-testid={`text-ship-type-${ship.id}`}>
          {ship.type.charAt(0).toUpperCase() + ship.type.slice(1)} - Tier {ship.tier}
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-xs mb-4">
          <div className="flex items-center space-x-1">
            <Heart className="h-3 w-3 text-red-500" />
            <span className="text-muted-foreground">Health:</span>
            <span className="font-mono text-foreground" data-testid={`text-ship-health-${ship.id}`}>
              {ship.health}/{ship.maxHealth}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Zap className="h-3 w-3 text-secondary" />
            <span className="text-muted-foreground">Speed:</span>
            <span className="font-mono text-foreground" data-testid={`text-ship-speed-${ship.id}`}>
              {ship.speed}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Package className="h-3 w-3 text-accent" />
            <span className="text-muted-foreground">Cargo:</span>
            <span className="font-mono text-foreground" data-testid={`text-ship-cargo-${ship.id}`}>
              {ship.cargo}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Shield className="h-3 w-3 text-destructive" />
            <span className="text-muted-foreground">Weapons:</span>
            <span className="font-mono text-foreground" data-testid={`text-ship-weapons-${ship.id}`}>
              {ship.weapons}
            </span>
          </div>
          <div className="flex items-center space-x-1 col-span-2">
            <Radar className="h-3 w-3 text-primary" />
            <span className="text-muted-foreground">Sensors:</span>
            <span className="font-mono text-foreground" data-testid={`text-ship-sensors-${ship.id}`}>
              {ship.sensors}
            </span>
          </div>
        </div>

        {/* Health bar if ship is damaged */}
        {ship.health < ship.maxHealth && (
          <div className="mb-3">
            <div className="w-full bg-muted rounded-full h-1.5">
              <div 
                className="bg-red-500 h-1.5 rounded-full transition-all" 
                style={{ width: `${(ship.health / ship.maxHealth) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
