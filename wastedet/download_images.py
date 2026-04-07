from icrawler.builtin import BingImageCrawler
import os

keywords = [
    "garbage pile street",
    "trash heap city",
    "plastic waste dump",
    "dirty garbage area",
    "waste collection heap",
    "roadside garbage",
    "overflowing dustbin",
    "municipal waste pile",
    "household garbage pile",
    "plastic bottles waste",
    "food waste trash",
    "urban garbage dump",
    "open waste dumping",
    "garbage landfill",
    "street trash pollution"
]

IMAGES_PER_KEYWORD = 100
base_dir = "dataset_raw"

os.makedirs(base_dir, exist_ok=True)

for keyword in keywords:
    folder_name = keyword.replace(" ", "_")
    save_path = os.path.join(base_dir, folder_name)

    print(f"\n📥 Downloading: {keyword}")

    crawler = BingImageCrawler(
        storage={'root_dir': save_path}
    )

    crawler.crawl(
        keyword=keyword,
        max_num=IMAGES_PER_KEYWORD
    )

print("\n✅ ALL IMAGES DOWNLOADED SUCCESSFULLY!")