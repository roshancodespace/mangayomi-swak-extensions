from pathlib import Path
import os
from glob import glob
from common import readFile, writeJsonFile, getParentPath, extensionInfo
from model import Source, ItemType

def formatExtensionInfo(info):
    exids = info.get("ids") or info.get("id") or None
    exlangs = info.get("langs") or ([info["lang"]] if "lang" in info else ["all"])

    bkInfo = info.copy()
    bkInfo.pop("ids", None)
    bkInfo.pop("langs", None)
    rd = []

    for lang in exlangs:
        id = exids
        if isinstance(exids, dict):
            id = exids.get(lang)
        bkInfo["id"] = id
        bkInfo["lang"] = lang
        pkgPath = bkInfo["pkgPath"]
        bkInfo["ItemType"] = (
            ItemType.manga
            if "manga/" in pkgPath
            else ItemType.anime
            if "anime/" in pkgPath
            else ItemType.novel
        )
        bkInfo["sourceCodeUrl"] = (
            "https://raw.githubusercontent.com/Swakshan/mangayomi-swak-extensions/refs/heads/main/javascript/"
            + pkgPath
        )
        rd.append(Source.fromJSON(bkInfo).toJSON())
    print("DONE: Ext-" + info["name"])
    return rd


def main():
    main_dir = getParentPath()
    root_folder = main_dir / "javascript/"
    js_files = glob(os.path.join(root_folder, "**", "*.js"), recursive=True)

    animeList = []
    mangaList = []
    novelList = []

    for filePath in js_files:
        try:
            paths = Path(filePath).resolve().parts
            info = extensionInfo(filePath)
            formattedInfo = formatExtensionInfo(info)

            if "anime" in paths:
                animeList.extend(formattedInfo)
            elif "manga" in paths:
                mangaList.extend(formattedInfo)
            else:
                novelList.extend(formattedInfo)

        except Exception as e:
            print("ERR: " + Path(filePath).name)
            print(e)

    writeJsonFile(main_dir / "anime_index.json", animeList)
    writeJsonFile(main_dir / "index.json", mangaList)
    writeJsonFile(main_dir / "novel_index.json", novelList)


if __name__ == "__main__":
    main()
