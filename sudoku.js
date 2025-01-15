// WordInfoManager 类封装 wordInfoList 和相关操作
class WordInfoManager {
  constructor() {
    this.wordInfoList = [];
  }

  // 遍历所有字母
  forEachWords(cb) {
    this.wordInfoList.forEach(wordInfoItem => {
      wordInfoItem.keys.forEach(letterInfoItem => cb(letterInfoItem));
    });
  }

  // 判断碰撞
  checkAvailable(startPos, endPos) {
    const curLine = { x1: startPos.x, y1: startPos.y, x2: endPos.x, y2: endPos.y };
    const otherLines = this.wordInfoList.map(wordInfoItem => {
      const startPosOther = wordInfoItem.keys[0];
      const endPosOther = wordInfoItem.keys[wordInfoItem.keys.length - 1];
      return { x1: startPosOther.x, y1: startPosOther.y, x2: endPosOther.x, y2: endPosOther.y };
    });
    return otherLines.filter(line => this.getLineDistance(curLine, line) < 2).length === 1;
  }

  // 计算两条线的距离
  getLineDistance(lineA, lineB) {
    const isHorizontalA = lineA.y1 === lineA.y2;
    const isHorizontalB = lineB.y1 === lineB.y2;

    if (isHorizontalA && isHorizontalB) {
      const overlapX = Math.max(0, Math.min(lineA.x2, lineB.x2) - Math.max(lineA.x1, lineB.x1));
      return overlapX > 0 ? Math.abs(lineA.y1 - lineB.y1) : Math.min(
        Math.hypot(lineA.x1 - lineB.x2, lineA.y1 - lineB.y2),
        Math.hypot(lineA.x2 - lineB.x1, lineA.y2 - lineB.y1)
      );
    }

    if (!isHorizontalA && !isHorizontalB) {
      const overlapY = Math.max(0, Math.min(lineA.y2, lineB.y2) - Math.max(lineA.y1, lineB.y1));
      return overlapY > 0 ? Math.abs(lineA.x1 - lineB.x1) : Math.min(
        Math.hypot(lineA.x1 - lineB.x1, lineA.y1 - lineB.y2),
        Math.hypot(lineA.x2 - lineB.x2, lineA.y2 - lineB.y1)
      );
    }

    const horizLine = isHorizontalA ? lineA : lineB;
    const vertLine = isHorizontalA ? lineB : lineA;
    const withinX = horizLine.x1 <= vertLine.x1 && vertLine.x1 <= horizLine.x2;
    const withinY = vertLine.y1 <= horizLine.y1 && horizLine.y1 <= vertLine.y2;

    if (withinX && withinY) return 0;
    return Math.min(
      Math.hypot(horizLine.x1 - vertLine.x1, horizLine.y1 - vertLine.y1),
      Math.hypot(horizLine.x2 - vertLine.x1, horizLine.y2 - vertLine.y1),
      Math.hypot(vertLine.x1 - horizLine.x1, vertLine.y2 - horizLine.y1),
      Math.hypot(vertLine.x1 - horizLine.x2, vertLine.y2 - horizLine.y2)
    );
  }

  // 添加单词
  addWord({ word, startPos, vertical, markPos }) {
    const { x, y } = startPos;
    this.wordInfoList.push({
      word,
      vertical,
      keys: word.split('').map((key, index) => ({
        key,
        x: vertical ? x : x + index,
        y: vertical ? y + index : y,
      }))
    });

    if (markPos) {
      this.forEachWords(letterInfoItem => {
        if (letterInfoItem.x === markPos.x && letterInfoItem.y === markPos.y) {
          letterInfoItem.used = true;
        }
      });
    }
  }

  // 判断是否可以交叉插入单词
  canPlaceWord(word, skipCount = 0) {
    const arr = word.split('');
    let matchIndex = 0;

    for (let i = 0; i < arr.length; i++) {
      for (const wordInfoItem of this.wordInfoList) {
        for (const letterInfoItem of wordInfoItem.keys) {
          if (letterInfoItem.key === arr[i]) {
            if (matchIndex++ < skipCount) continue;
            const { x, y } = letterInfoItem;
            const targetVertical = !wordInfoItem.vertical;
            const startPos = targetVertical ? { x, y: y - i } : { x: x - i, y };
            const endPos = targetVertical ? { x, y: startPos.y + arr.length - 1 } : { x: startPos.x + arr.length - 1, y };
            if (this.checkAvailable(startPos, endPos)) {
              return { startPos, vertical: targetVertical, markPos: { x, y } };
            }
          }
        }
      }
    }
    return null;
  }

  // 插入单词（基于重叠）
  addWordByOverlap(word, skipCount = 0) {
    const placement = this.canPlaceWord(word, skipCount);
    if (placement) {
      this.addWord({ word, ...placement });
      return true;
    }
    return false;
  }

  // 单词拼接（回溯算法）
  sudoku(words) {
    const sortWords = words.sort((a, b) => b.length - a.length);
    this.wordInfoList = [];
    for (let i = 0; i < sortWords.length; i++) {
      const word = sortWords[i];
      if (i === 0) {
        this.addWord({ word, startPos: { x: 0, y: 0 }, vertical: false });
      } else {
        let success = this.addWordByOverlap(word);
        let skipCount = 0;
        while (!success && skipCount < 5) {
          this.wordInfoList.pop();
          success = this.addWordByOverlap(sortWords[i - 1], ++skipCount);
          if (success) success = this.addWordByOverlap(word);
        }
        if (!success) return { data: null, state: false, msg: word }
      }
    }
    return { data: this.wordInfoList, state: true };
  }
}
