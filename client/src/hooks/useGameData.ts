import { useQuery } from "@tanstack/react-query";
import { gameApi } from "@/lib/gameApi";

// Mock Discord ID - in production this would come from Discord OAuth
const MOCK_DISCORD_ID = "mock_discord_user_123";

export function useGameData() {
  const { data: user, isLoading: userLoading, error: userError } = useQuery({
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

  const { data: resources = [], isLoading: resourcesLoading } = useQuery({
    queryKey: ['/api/user', user?.id, 'resources'],
    queryFn: () => gameApi.getUserResources(user!.id),
    enabled: !!user?.id,
    retry: false
  });

  const { data: explorations = [], isLoading: explorationsLoading } = useQuery({
    queryKey: ['/api/user', user?.id, 'explorations'],
    queryFn: () => gameApi.getUserExplorations(user!.id),
    enabled: !!user?.id,
    retry: false
  });

  const { data: guilds = [] } = useQuery({
    queryKey: ['/api/guilds'],
    queryFn: gameApi.getGuilds,
    retry: false
  });

  const { data: marketItems = [] } = useQuery({
    queryKey: ['/api/market/items'],
    queryFn: gameApi.getMarketItems,
    retry: false
  });

  const { data: recipes = [] } = useQuery({
    queryKey: ['/api/recipes'],
    queryFn: gameApi.getRecipes,
    retry: false
  });

  const activeShip = ships.find((ship: any) => ship.isActive);
  const userGuild = user?.guildId ? guilds.find((g: any) => g.id === user.guildId) : null;

  return {
    user,
    ships,
    resources,
    explorations,
    guilds,
    marketItems,
    recipes,
    activeShip,
    userGuild,
    isLoading: userLoading || shipsLoading || resourcesLoading || explorationsLoading,
    userError,
    hasUser: !!user,
    discordId: MOCK_DISCORD_ID
  };
}
