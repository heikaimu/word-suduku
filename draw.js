/**
 * 画布绘制画布绘制画布绘制画布绘制画布绘制画布绘制画布绘制画布绘制画布绘制画布绘制画布绘制画布绘制画布绘制画布绘制画布绘制画布绘制画布绘制画布绘制画布绘制画布绘制画布绘制画布绘制
 * @param {*} data 
 */

// 画布绘制
function drawCanvas(data) {
  let minX = 0;
  let minY = 0;
  data.forEach(word => {
    word.keys.forEach(letter => {
      if (letter.x < minX) {
        minX = letter.x
      }
      if (letter.y < minY) {
        minY = letter.y
      }
    })
  })

  // 获取canvas和2D上下文
  const canvas = document.getElementById('myCanvas');
  const ctx = canvas.getContext('2d');
  // 清空整个画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 设置字母矩形的尺寸
  const letterWidth = 30;  // 每个字母矩形的宽度
  const letterHeight = 30; // 每个字母矩形的高度

  // 设置绘制的字体样式
  ctx.font = '20px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 绘制矩形和字母
  function drawLetters(data) {
    data.forEach(wordObject => {
      wordObject.keys.forEach(letter => {
        const x = letter.x * letterWidth - minX * letterWidth; // 根据矩阵坐标计算x
        const y = letter.y * letterHeight - minY * letterHeight; // 根据矩阵坐标计算y

        // 绘制矩形
        ctx.strokeRect(x, y, letterWidth, letterHeight);

        // 绘制字母
        ctx.fillText(letter.key, x + letterWidth / 2, y + letterHeight / 2);
      });
    });
  }

  // 执行绘制
  drawLetters(data);

}
