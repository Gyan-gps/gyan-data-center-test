
export interface RawTOCItem {
  text?: string;
  list?: RawTOCItem[];
}

export interface TOCNode {
  text: string;
  number: string;
  level: number;
  children?: TOCNode[];
}


export function transformTOC(toc: RawTOCItem[] = []): TOCNode[] {
  try {
    const recurse = (
      list: RawTOCItem[] = [],
      level: number = 1,
      parentIndex: number[] = []
    ): TOCNode[] => {
      const children: TOCNode[] = [];

      if (!Array.isArray(list) || !list.length || list.includes(null as any)) {
        return children;
      }

      list.forEach((obj, index) => {
        const currentNumber = [...parentIndex, index + 1].join(".");

        const currentItem: TOCNode = {
          text: obj.text || "",
          level,
          number: currentNumber,
        };

        if (obj.list && obj.list.length > 0) {
          const subChildren = recurse(obj.list, level + 1, [
            ...parentIndex,
            index + 1,
          ]);

          children.push(currentItem);

          if (level <= 2) {
            currentItem.children = subChildren;
          } else {
            children.push(...subChildren);
          }
        } else {
          const subChildren = recurse(obj.list as any, level + 1, [
            ...parentIndex,
            index + 1,
          ]);
          children.push(currentItem, ...subChildren);
        }
      });

      return children;
    };

    return toc.map((item, index) => ({
      text: item.text || "",
      level: 1,
      number: (index + 1).toString(),
      children: recurse(item.list || [], 2, [index + 1]),
    }));
  } catch (error) {
    console.error("ERROR in transformTOC:", error);
    return [];
  }
}
