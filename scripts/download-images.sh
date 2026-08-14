#!/bin/bash
# Download all food images from image search results

set -e
cd /home/z/my-project/public/images

echo "📥 Downloading food images..."

# Breakfast - unique images for items that shared
curl -sL "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/b56ac7b19ab3.jpg" -o breakfast/omelette-toast.jpg &
curl -sL "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/cc1ff8ef81d4.jpg" -o breakfast/hausa-koko-koose.jpg &
curl -sL "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/9f01564e7fa1.png" -o breakfast/oats-fruit.jpg &
curl -sL "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/208e748777f6.jpg" -o breakfast/english-breakfast.jpg &
curl -sL "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/f0fec9d94744.jpg" -o breakfast/rice-water.jpg &

# Sides - unique coleslaw image
curl -sL "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/dcfc67cb15c7.jpg" -o extras/coleslaw.jpg &

# New drinks
curl -sL "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/f85dd9570fca.jpg" -o drinks/palm-wine.jpg &
curl -sL "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/2a16ac1fce04.jpg" -o drinks/asaana.jpg &
curl -sL "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/7fa688be3e36.jpg" -o drinks/fan-yogo.jpg &
curl -sL "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/d0c1472931d7.png" -o drinks/fan-choco.png &
curl -sL "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/ca64a15700fa.jpg" -o drinks/iced-coffee.jpg &

# New desserts
curl -sL "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/d70de36d23d8.jpg" -o desserts/ice-cream.jpg &

# New protein items
curl -sL "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/2420c90c71d1.jpg" -o meals/chichinga.jpg &

# Restaurant images
curl -sL "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/69481af797cf.jpeg" -o restaurant/restaurant-interior.jpg &
curl -sL "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/fcedd775f03f.jpg" -o restaurant/kitchen-cooking.jpg &

wait
echo "✅ All images downloaded!"

# Check file sizes
echo ""
echo "📊 New image sizes:"
for f in breakfast/omelette-toast.jpg breakfast/hausa-koko-koose.jpg breakfast/oats-fruit.jpg breakfast/english-breakfast.jpg breakfast/rice-water.jpg extras/coleslaw.jpg drinks/palm-wine.jpg drinks/asaana.jpg drinks/fan-yogo.jpg drinks/fan-choco.png drinks/iced-coffee.jpg desserts/ice-cream.jpg meals/chichinga.jpg restaurant/restaurant-interior.jpg restaurant/kitchen-cooking.jpg; do
  if [ -f "$f" ]; then
    size=$(stat -c%s "$f")
    echo "  ✅ $f ($(( size / 1024 ))KB)"
  else
    echo "  ❌ $f MISSING"
  fi
done
