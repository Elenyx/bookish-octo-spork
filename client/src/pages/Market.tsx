import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { gameApi } from "@/lib/gameApi";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Store, TrendingUp, TrendingDown, Package, ShoppingCart, Coins, Wrench } from "lucide-react";

// Mock Discord ID - in production this would come from Discord OAuth
const MOCK_DISCORD_ID = "mock_discord_user_123";

export default function Market() {
  const [buyQuantity, setBuyQuantity] = useState<number>(1);
  const [sellQuantity, setSellQuantity] = useState<number>(1);
  const [sellPrice, setSellPrice] = useState<number>(0);
  const [selectedResource, setSelectedResource] = useState<string>("");
  const { toast } = useToast();

  const { data: user } = useQuery({
    queryKey: ['/api/user', MOCK_DISCORD_ID],
    queryFn: () => gameApi.getUser(MOCK_DISCORD_ID),
    retry: false
  });

  const { data: marketItems = [], isLoading: marketLoading } = useQuery({
    queryKey: ['/api/market/items'],
    queryFn: gameApi.getMarketItems,
    retry: false
  });

  const { data: resources = [] } = useQuery({
    queryKey: ['/api/user', user?.id, 'resources'],
    queryFn: () => gameApi.getUserResources(user!.id),
    enabled: !!user?.id,
    retry: false
  });

  const { data: recipes = [] } = useQuery({
    queryKey: ['/api/recipes'],
    queryFn: gameApi.getRecipes,
    retry: false
  });

  const buyItemMutation = useMutation({
    mutationFn: (data: { itemName: string; quantity: number }) =>
      gameApi.buyItem(user!.id, data.itemName, data.quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({ title: "Purchase successful!" });
      setBuyQuantity(1);
    },
    onError: (error: any) => {
      toast({
        title: "Purchase failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const sellResourceMutation = useMutation({
    mutationFn: (data: { resourceId: string; quantity: number; pricePerUnit: number }) =>
      gameApi.sellResource(user!.id, data.resourceId, data.quantity, data.pricePerUnit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({ title: "Sale successful!" });
      setSellQuantity(1);
      setSellPrice(0);
      setSelectedResource("");
    },
    onError: (error: any) => {
      toast({
        title: "Sale failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const craftItemMutation = useMutation({
    mutationFn: (recipeId: string) => gameApi.craftItem(user!.id, recipeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({ title: "Item crafted successfully!" });
    },
    onError: (error: any) => {
      toast({
        title: "Crafting failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleBuyItem = (itemName: string) => {
    buyItemMutation.mutate({ itemName, quantity: buyQuantity });
  };

  const handleSellResource = () => {
    if (!selectedResource || sellQuantity <= 0 || sellPrice <= 0) {
      toast({
        title: "Invalid input",
        description: "Please select a resource and enter valid quantity and price",
        variant: "destructive"
      });
      return;
    }
    sellResourceMutation.mutate({
      resourceId: selectedResource,
      quantity: sellQuantity,
      pricePerUnit: sellPrice
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-orbitron font-bold text-primary glow-text">
          Galactic Market
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

      <Tabs defaultValue="buy" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="buy" data-testid="tab-buy">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Buy Items
          </TabsTrigger>
          <TabsTrigger value="sell" data-testid="tab-sell">
            <Coins className="h-4 w-4 mr-2" />
            Sell Resources
          </TabsTrigger>
          <TabsTrigger value="craft" data-testid="tab-craft">
            <Wrench className="h-4 w-4 mr-2" />
            Crafting
          </TabsTrigger>
        </TabsList>

        {/* Buy Items Tab */}
        <TabsContent value="buy" className="space-y-6">
          <Card className="glow-border">
            <CardHeader>
              <CardTitle className="text-primary">
                <Store className="h-5 w-5 inline mr-2" />
                Market Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              {marketLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading market data...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {marketItems.map((item: any, index: number) => (
                    <Card key={index} className="border hover:border-primary/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-foreground" data-testid={`text-item-name-${index}`}>
                            {item.name}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {item.rarity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {item.description}
                        </p>
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Price:</span>
                            <span className="font-mono ml-1 text-accent font-bold" data-testid={`text-item-price-${index}`}>
                              {item.price.toLocaleString()} ₡
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Stock:</span>
                            <span className="font-mono ml-1 text-foreground" data-testid={`text-item-stock-${index}`}>
                              {item.availability}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            min="1"
                            max={item.availability}
                            value={buyQuantity}
                            onChange={(e) => setBuyQuantity(parseInt(e.target.value) || 1)}
                            className="w-20"
                            data-testid={`input-buy-quantity-${index}`}
                          />
                          <Button
                            size="sm"
                            disabled={!user || item.availability === 0 || buyItemMutation.isPending}
                            onClick={() => handleBuyItem(item.name)}
                            data-testid={`button-buy-${index}`}
                          >
                            Buy
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sell Resources Tab */}
        <TabsContent value="sell" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-primary">Sell Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="resource-select">Select Resource</Label>
                  <Select value={selectedResource} onValueChange={setSelectedResource}>
                    <SelectTrigger data-testid="select-resource-to-sell">
                      <SelectValue placeholder="Choose a resource to sell" />
                    </SelectTrigger>
                    <SelectContent>
                      {resources.map((resource: any) => (
                        <SelectItem key={resource.id} value={resource.id}>
                          {resource.name} (x{resource.quantity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sell-quantity">Quantity</Label>
                    <Input
                      id="sell-quantity"
                      type="number"
                      min="1"
                      value={sellQuantity}
                      onChange={(e) => setSellQuantity(parseInt(e.target.value) || 1)}
                      data-testid="input-sell-quantity"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sell-price">Price per Unit</Label>
                    <Input
                      id="sell-price"
                      type="number"
                      min="1"
                      value={sellPrice}
                      onChange={(e) => setSellPrice(parseInt(e.target.value) || 0)}
                      data-testid="input-sell-price"
                    />
                  </div>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Total Income:</span>
                    <span className="font-mono ml-1 text-accent font-bold">
                      {(sellQuantity * sellPrice).toLocaleString()} ₡
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  disabled={!selectedResource || sellQuantity <= 0 || sellPrice <= 0 || sellResourceMutation.isPending}
                  onClick={handleSellResource}
                  data-testid="button-sell-resource"
                >
                  <Coins className="h-4 w-4 mr-2" />
                  List for Sale
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-primary">Your Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {resources.length > 0 ? (
                    resources.map((resource: any, index: number) => (
                      <div key={resource.id} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div>
                          <div className="font-medium text-foreground" data-testid={`text-resource-name-${index}`}>
                            {resource.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {resource.rarity} • {resource.type}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-foreground" data-testid={`text-resource-quantity-${index}`}>
                            x{resource.quantity}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ~{resource.value} ₡ each
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No resources to sell</p>
                      <p className="text-sm text-muted-foreground">Explore space to gather materials</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Crafting Tab */}
        <TabsContent value="craft" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">
                <Wrench className="h-5 w-5 inline mr-2" />
                Available Recipes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recipes.length > 0 ? (
                  recipes.map((recipe: any, index: number) => (
                    <Card key={recipe.id} className="border hover:border-primary/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-foreground" data-testid={`text-recipe-name-${index}`}>
                            {recipe.name}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {recipe.rarity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {recipe.description}
                        </p>
                        
                        <div className="space-y-2 mb-3">
                          <h5 className="text-xs font-medium text-muted-foreground">Materials Required:</h5>
                          {recipe.materials?.map((material: any, matIndex: number) => (
                            <div key={matIndex} className="text-xs flex justify-between">
                              <span>{material.name}</span>
                              <span className="font-mono">x{material.quantity}</span>
                            </div>
                          ))}
                        </div>

                        <Button
                          size="sm"
                          className="w-full"
                          disabled={craftItemMutation.isPending}
                          onClick={() => craftItemMutation.mutate(recipe.id)}
                          data-testid={`button-craft-${index}`}
                        >
                          Craft Item
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No recipes available</p>
                    <p className="text-sm text-muted-foreground">Discover recipes through exploration</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
