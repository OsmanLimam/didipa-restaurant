import { db } from '../src/lib/db';

const IMAGE_MAP: Record<string, string> = {
  "jollof-rice-chicken": "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/2024bcfe1005.jpg",
  "banku-okro-soup": "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/8db2bf3b77d5.jpg",
  "waakye": "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/c1a96e09944e.jpg",
  "fufu-light-soup": "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/27caf76d14d0.jpg",
  "kenkey-fried-fish": "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/3e901e759503.jpg",
  "fried-rice": "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/420d10d1c527.jpg",
  "omotuo": "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/f91b752208e0.jpg",
  "plain-rice-stew": "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/c47b522c04ba.jpg",
  "red-red": "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/2e2b5380d571.jpg",
  "palava-sauce": "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/168feeaf0af7.jpg",
  "egusi-soup": "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/f2db470237dc.jpg",
  "groundnut-soup": "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/bd6c78dc5ae2.jpg",
  "grilled-tilapia": "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/e01b504b3c5c.jpg",
  "suya": "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/68c370de5dea.jpg",
  "fried-yam-fish": "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/2075121cc73f.jpg",
  "kelewele": "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/cc6a9421e8b7.jpg",
  "fried-plantain": "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/f063c3058e72.jpg",
  "gari-foto": "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/f947946b1c47.jpg",
  "ampesie": "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/333ba9a60967.jpg",
  "tuo-zaafi": "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/b9ee207bec0d.jpg",
  "sobolo": "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/3a3829bd4834.jpg",
  "palm-wine": "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/fbd62dd6aa0f.jpg",
  "asaana": "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/2a16ac1fce04.jpg",
  "bottled-water": "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/11c273f4dd4f.jpg",
  "meat-pie": "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/e89c7959701f.jpg",
  "kelewele-groundnuts": "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/8144c6268f7b.jpg",
};

async function main() {
  console.log('🖼️  Updating menu item images...');

  for (const [slug, url] of Object.entries(IMAGE_MAP)) {
    const result = await db.menuItem.updateMany({
      where: { slug },
      data: { image: url },
    });
    console.log(`  ✅ ${slug}: ${result.count} updated`);
  }

  console.log('🎉 All images updated!');
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
