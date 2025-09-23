import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatBar from "@/components/StatBar";
import { gameApi } from "@/lib/gameApi";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Shield, Users, Trophy, Gem, TrendingUp, Crown, Sword, Compass, Microscope, Banknote } from "lucide-react";

// Mock Discord ID - in production this would come from Discord OAuth
const MOCK_DISCORD_ID = "mock_discord_user_123";

export default function Guild() {
  const { toast } = useToast();

  const { data: user } = useQuery({
    queryKey: ['/api/user', MOCK_DISCORD_ID],
    queryFn: () => gameApi.getUser(MOCK_DISCORD_ID),
    retry: false
  });

  const { data: guilds = [] } = useQuery({
    queryKey: ['/api/guilds'],
    queryFn: gameApi.getGuilds,
    retry: false
  });

  const joinGuildMutation = useMutation({
    mutationFn: (guildId: string) => gameApi.joinGuild(user!.id, guildId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: "Guild Joined!",
        description: `Welcome to ${data.guild?.name}!`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to join guild",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const contributeGuildMutation = useMutation({
    mutationFn: (data: { resourceType: string; amount: number }) => 
      gameApi.contributeToGuild(user!.id, data.resourceType, data.amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({ title: "Contribution successful!" });
    },
    onError: (error: any) => {
      toast({
        title: "Contribution failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const userGuild = user?.guildId ? guilds.find(g => g.id === user.guildId) : null;

  const guildTypeIcons = {
    military: Sword,
    trade: Banknote,
    exploration: Compass,
    research: Microscope
  };

  const guildTypeColors = {
    military: 'text-destructive',
    trade: 'text-accent',
    exploration: 'text-primary',
    research: 'text-secondary'
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-orbitron font-bold text-primary glow-text">
          Guild Command
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

      {userGuild ? (
        /* User is in a guild */
        <div className="space-y-8">
          {/* Guild Status */}
          <Card className="glow-border">
            <CardHeader>
              <CardTitle className="text-primary flex items-center">
                <Shield className="h-6 w-6 mr-2" />
                {userGuild.name}
                {(() => {
                  const Icon = guildTypeIcons[userGuild.type as keyof typeof guildTypeIcons] || Shield;
                  const color = guildTypeColors[userGuild.type as keyof typeof guildTypeColors] || 'text-primary';
                  return <Icon className={`h-5 w-5 ml-2 ${color}`} />;
                })()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center">
                  <img 
                    src="https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" 
                    alt="Guild emblem" 
                    className="rounded-lg w-24 h-24 mx-auto object-cover mb-4"
                  />
                  <h3 className="font-orbitron font-bold text-xl" data-testid="text-guild-name">
                    {userGuild.name}
                  </h3>
                  <p className="text-muted-foreground" data-testid="text-guild-type">
                    {userGuild.type.charAt(0).toUpperCase() + userGuild.type.slice(1)} Guild
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Guild Level</span>
                      <Badge className="bg-accent text-accent-foreground" data-testid="badge-guild-level">
                        Level {userGuild.level}
                      </Badge>
                    </div>
                    <StatBar 
                      value={userGuild.experience % 1000} 
                      max={1000} 
                      className="h-2"
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {userGuild.experience} / {userGuild.level * 1000} XP
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Members</span>
                      <div className="font-mono text-foreground" data-testid="text-guild-members">
                        {userGuild.memberCount}/{userGuild.maxMembers}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Rank</span>
                      <div className="font-mono text-secondary" data-testid="text-guild-rank">
                        #{Math.floor(Math.random() * 10) + 1}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-2 gap-4">
                <Button 
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => contributeGuildMutation.mutate({ resourceType: 'credits', amount: 100 })}
                  disabled={!user?.credits || user.credits < 100 || contributeGuildMutation.isPending}
                  data-testid="button-contribute-credits"
                >
                  <Gem className="h-4 w-4 mr-2" />
                  Contribute Credits
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => contributeGuildMutation.mutate({ resourceType: 'nexium', amount: 1 })}
                  disabled={!user?.nexium || user.nexium < 1 || contributeGuildMutation.isPending}
                  data-testid="button-contribute-nexium"
                >
                  <Gem className="h-4 w-4 mr-2" />
                  Contribute Nexium
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Guild Benefits */}
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">Guild Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto text-accent mb-2" />
                  <h4 className="font-semibold">Experience Bonus</h4>
                  <p className="text-sm text-muted-foreground">+{userGuild.level * 2}%</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Shield className="h-6 w-6 mx-auto text-primary mb-2" />
                  <h4 className="font-semibold">Defense Bonus</h4>
                  <p className="text-sm text-muted-foreground">+{userGuild.level * 5} Points</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Users className="h-6 w-6 mx-auto text-secondary mb-2" />
                  <h4 className="font-semibold">Group Activities</h4>
                  <p className="text-sm text-muted-foreground">Unlocked</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Crown className="h-6 w-6 mx-auto text-accent mb-2" />
                  <h4 className="font-semibold">Prestige</h4>
                  <p className="text-sm text-muted-foreground">Guild Rank #{Math.floor(Math.random() * 10) + 1}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Guild Rankings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">
                <Trophy className="h-5 w-5 inline mr-2" />
                Guild Rankings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {guilds.sort((a, b) => (b.level * 1000 + b.experience) - (a.level * 1000 + a.experience)).slice(0, 10).map((guild, index) => {
                  const Icon = guildTypeIcons[guild.type as keyof typeof guildTypeIcons] || Shield;
                  const color = guildTypeColors[guild.type as keyof typeof guildTypeColors] || 'text-primary';
                  const isCurrentGuild = guild.id === userGuild.id;
                  
                  return (
                    <div 
                      key={guild.id} 
                      className={`flex items-center justify-between p-3 rounded-lg ${isCurrentGuild ? 'bg-primary/10 border border-primary/20' : 'bg-muted'}`}
                    >
                      <div className="flex items-center space-x-3">
                        <Badge variant={index < 3 ? "default" : "secondary"} className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <Icon className={`h-5 w-5 ${color}`} />
                        <div>
                          <div className="font-semibold text-foreground" data-testid={`text-ranked-guild-${index}`}>
                            {guild.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Level {guild.level} • {guild.memberCount} members
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-foreground">
                          {(guild.level * 1000 + guild.experience).toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">Power</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* User not in a guild */
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">Available Guilds</CardTitle>
              <p className="text-muted-foreground">Choose a guild to join and begin your organized space exploration</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {guilds.map(guild => {
                  const Icon = guildTypeIcons[guild.type as keyof typeof guildTypeIcons] || Shield;
                  const color = guildTypeColors[guild.type as keyof typeof guildTypeColors] || 'text-primary';
                  
                  return (
                    <Card key={guild.id} className="border-2 hover:border-primary/50 transition-colors">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Icon className={`h-6 w-6 mr-2 ${color}`} />
                          {guild.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground" data-testid={`text-guild-description-${guild.id}`}>
                          {guild.description || `A ${guild.type} focused guild`}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Type</span>
                            <Badge variant="outline" className={color} data-testid={`badge-guild-type-${guild.id}`}>
                              {guild.type.charAt(0).toUpperCase() + guild.type.slice(1)}
                            </Badge>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Level</span>
                            <span className="font-mono text-foreground" data-testid={`text-guild-level-${guild.id}`}>
                              {guild.level}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Members</span>
                            <span className="font-mono text-foreground" data-testid={`text-guild-member-count-${guild.id}`}>
                              {guild.memberCount}/{guild.maxMembers}
                            </span>
                          </div>
                          <Button 
                            className="w-full mt-4"
                            disabled={guild.memberCount >= guild.maxMembers || joinGuildMutation.isPending}
                            onClick={() => joinGuildMutation.mutate(guild.id)}
                            data-testid={`button-join-guild-${guild.id}`}
                          >
                            {guild.memberCount >= guild.maxMembers ? 'Full' : 'Join Guild'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Guild Type Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">Guild Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3 p-4 bg-muted rounded-lg">
                  <Sword className="h-6 w-6 text-destructive mt-1" />
                  <div>
                    <h4 className="font-semibold text-destructive">Military</h4>
                    <p className="text-sm text-muted-foreground">
                      Combat-focused guilds specializing in fleet battles and territorial control
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 bg-muted rounded-lg">
                  <Banknote className="h-6 w-6 text-accent mt-1" />
                  <div>
                    <h4 className="font-semibold text-accent">Trade</h4>
                    <p className="text-sm text-muted-foreground">
                      Economic guilds focused on resource trading and market manipulation
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 bg-muted rounded-lg">
                  <Compass className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold text-primary">Exploration</h4>
                    <p className="text-sm text-muted-foreground">
                      Discovery-oriented guilds mapping unknown sectors and finding artifacts
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 bg-muted rounded-lg">
                  <Microscope className="h-6 w-6 text-secondary mt-1" />
                  <div>
                    <h4 className="font-semibold text-secondary">Research</h4>
                    <p className="text-sm text-muted-foreground">
                      Technology-focused guilds advancing ship upgrades and new technologies
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
