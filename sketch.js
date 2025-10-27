let t = 0.0;
let vel = 0.02;
let num;
let paletteSelected;
let paletteSelected1;
let paletteSelected2;

// 新增：側邊選單相關變數
let sideMenuDiv;
let menuWidth = 320;
let menuX = 0;
let menuTargetX = 0;
let menuHiddenX = 0; // 會在 setup 設定為 -menuWidth
let menuVisibleX = 0;

// 新增：iframe 相關變數
let iframeOverlay = null;
let iframeInner = null;
let iframeURL = 'https://rogerkuo940307-lgtm.github.io/20251020/';

function setup() {
    createCanvas(windowWidth, windowHeight);
    pixelDensity(2)
    angleMode(DEGREES);
    num = random(100000);
    paletteSelected = random(palettes);
    paletteSelected1 = random(palettes);
    paletteSelected2 = random(palettes);

    // 讓 canvas 在背景，選單能覆蓋在上方
    let cnv = select('canvas');
    if (cnv) {
      cnv.style('display','block');
      cnv.style('position','fixed');
      cnv.style('left','0px');
      cnv.style('top','0px');
      cnv.style('z-index','0');
    }

    // 設定選單位置參數
    menuHiddenX = -menuWidth;
    menuVisibleX = 0;
    menuX = menuHiddenX;
    menuTargetX = menuHiddenX;

    // 建立 CSS（含 hover 顏色、字型大小）
    let style = createElement('style',
      `.side-menu{
         position:fixed;
         top:0;
         left:0;
         width:${menuWidth}px;
         height:100vh;
         background:rgba(20,20,30,0.92);
         box-shadow:2px 0 10px rgba(0,0,0,0.6);
         padding-top:80px;
         z-index:9999;
         transform:translateX(${menuHiddenX}px);
         transition:none;
         font-family:Arial, Helvetica, sans-serif;
      }
      .side-menu .menu-item{
         color:#ffffff;
         font-size:32px;
         padding:18px 28px;
         user-select:none;
         cursor:pointer;
         transition:color 180ms ease;
      }
      .side-menu .menu-item:hover{
         color:#ffd166;
      }
      /* 小提示：當滑鼠在選單上時不要把滑鼠事件傳給 canvas */
      .side-menu { pointer-events:auto; }`
    );
    style.parent(document.head);

    // 建立選單 HTML
    sideMenuDiv = createDiv(`
      <div class="side-menu" id="sideMenu">
        <div class="menu-item" id="item1">第一單元作品</div>
        <div class="menu-item" id="item2">第一單元講義</div>
        <div class="menu-item" id="item3">測驗系統</div>
        <div class="menu-item" id="item4">回首頁</div>
      </div>
    `);
    // parent 到 body（預設），並移除額外包層，直接取得實際 menu 元素
    sideMenuDiv.child(sideMenuDiv.elt.firstElementChild).attribute('id','sideMenuWrapper');
    // 直接選取真正的 .side-menu 元素
    let realMenu = select('#sideMenu');
    if (realMenu) {
      realMenu.style('position','fixed');
      realMenu.style('top','0px');
      realMenu.style('left','0px');
      realMenu.style('width', menuWidth + 'px');
      realMenu.style('height','100vh');
      realMenu.style('z-index','9999');
      // 初始放到隱藏位置（我們會用 JS 動畫）
      realMenu.style('transform', `translateX(${menuHiddenX}px)`);
      realMenu.elt.style.pointerEvents = 'auto';
      // 監聽點擊（已修改：item2 以 iframe 顯示 HackMD）
      select('#item1').mousePressed(()=>{ showIframe(); });
      select('#item2').mousePressed(()=>{
        iframeURL = 'https://hackmd.io/@XLpu1BirQ4C3KLRLl7X1Tg/Bk9xwQRigg';
        showIframe();
      });
      select('#item3').mousePressed(()=>{ console.log('點選：測驗系統'); });
      select('#item4').mousePressed(()=>{ console.log('點選：回首頁'); });
    }
}

function draw() {
  randomSeed(num);
  // background("#355070");
  background(bgCol())
  stroke("#355070");
  circlePacking();

  // 側邊選單滑出/收起邏輯（平滑動畫）
  let edgeThreshold = 24; // 當滑鼠靠近左側邊緣時觸發
  let menuHoverBuffer = menuWidth + 8; // 當滑鼠移到選單範圍外多少時收回
  if (mouseX <= edgeThreshold) {
    menuTargetX = menuVisibleX;
  } else if (mouseX > menuHoverBuffer) {
    menuTargetX = menuHiddenX;
  }
  // lerp 平滑移動
  menuX = lerp(menuX, menuTargetX, 0.14);
  // 套用到實際 DOM 元素
  let realMenu = select('.side-menu');
  if (realMenu) {
    realMenu.style('transform', `translateX(${menuX}px)`);
  }
}

function circlePacking() {
  push();

  translate(width / 2, height / 2)
  let points = [];
  let count = 2000;
  for (let i = 0; i < count; i++) {
    let a = random(360);
    let d = random(width * 0.35);
    let s = random(200);
    let x = cos(a) * (d - s / 2);
    let y = sin(a) * (d - s / 2);
    let add = true;
    for (let j = 0; j < points.length; j++) {
      let p = points[j];
      if (dist(x, y, p.x, p.y) < (s + p.z) * 0.6) {
        add = false;
        break;
      }
    }
    if (add) points.push(createVector(x, y, s));
  }
  for (let i = 0; i < points.length; i++) {

    let p = points[i];
    let rot = random(360);
    push();
    translate(p.x, p.y);
    rotate(rot);
    blendMode(OVERLAY)
    let r = p.z - 5;
    gradient(r)
    shape(0, 0, r)
    pop();
  }
  pop();
 }

function shape(x, y, r) {
  push();
noStroke();
//fill(randomCol())
  translate(x, y);
  let radius = r; //半径
  let nums = 8
  for (let i = 0; i < 360; i += 360 / nums) {
    let ex = radius * sin(i);
    let ey = radius * cos(i);
    push();
    translate(ex,ey)
    rotate(atan2(ey, ex))
    distortedCircle(0,0,r);
  
    pop();
    stroke(randomCol())
    strokeWeight(0.5)
    line(0,0,ex,ey)
    ellipse(ex,ey,2)
  }


  pop();
}

function distortedCircle(x, y, r) {
  push();
  translate(x, y)
  //points
  let p1 = createVector(0, -r / 2);
  let p2 = createVector(r / 2, 0);
  let p3 = createVector(0, r / 2);
  let p4 = createVector(-r / 2, 0)
  //anker
  let val = 0.3;
  let random_a8_1 = random(-r * val, r * val)
  let random_a2_3 = random(-r * val, r * val)
  let random_a4_5 = random(-r * val, r * val)
  let random_a6_7 = random(-r * val, r * val)
  let ran_anker_lenA = r * random(0.2, 0.5)
  let ran_anker_lenB = r * random(0.2, 0.5)
  let a1 = createVector(ran_anker_lenA, -r / 2 + random_a8_1);
  let a2 = createVector(r / 2 + random_a2_3, -ran_anker_lenB);
  let a3 = createVector(r / 2 - random_a2_3, ran_anker_lenA);
  let a4 = createVector(ran_anker_lenB, r / 2 + random_a4_5);
  let a5 = createVector(-ran_anker_lenA, r / 2 - random_a4_5);
  let a6 = createVector(-r / 2 + random_a6_7, ran_anker_lenB);
  let a7 = createVector(-r / 2 - random_a6_7, -ran_anker_lenA);
  let a8 = createVector(-ran_anker_lenB, -r / 2 - random_a8_1);
  beginShape();
  vertex(p1.x, p1.y);
  bezierVertex(a1.x, a1.y, a2.x, a2.y, p2.x, p2.y)
  bezierVertex(a3.x, a3.y, a4.x, a4.y, p3.x, p3.y)
  bezierVertex(a5.x, a5.y, a6.x, a6.y, p4.x, p4.y)
  bezierVertex(a7.x, a7.y, a8.x, a8.y, p1.x, p1.y)
  endShape();
  pop();
}
 function mouseClicked() {
  shuffle(paletteSelected, true);
   shuffle(bgpalette,true);
}
function randomCol(){
  let randoms = int(random(1,paletteSelected.length));
  return color(paletteSelected[randoms]);
 }
function bgCol(){
  let randoms = int(random(0,bgpalette.length));
  return color(bgpalette[randoms]);
 }

function gradient(r) {
  col1 = color(random(paletteSelected1));
  //col1.setAlpha(130)
  col2 = random(paletteSelected2);

  noStroke();
  let gradientFill = drawingContext.createLinearGradient(
    0,
    -r,
    0,
    r
  );
  gradientFill.addColorStop(0, color(col1));
  gradientFill.addColorStop(1, color(col2));
  drawingContext.fillStyle = gradientFill;
}
//example, [0]= background,[1]= stroke, [2~6] = fill
let bgpalette =   ["#488a50",  "#bf5513", "#3b6fb6", "#4f3224", "#9a7f6e","#1c3560", '#4a4e69',"#333","#413e49","#5da4a9"]
let  palettes = [
  ["#e9dbce", "#ea526f", "#fceade", "#e2c290", "#6b2d5c", "#25ced1"],
  ["#e9dbce", "#d77a61", "#223843", "#eff1f3", "#dbd3d8", "#d8b4a0"],
  ["#e29578", "#006d77", "#83c5be", "#ffddd2", "#edf6f9"],
  ["#e9dbce", "#cc3528", "#028090", "#00a896", "#f8c522"],
  ["#e9dbce", "#92accc", "#f8f7c1", "#f46902", "#da506a", "#fae402"],
  ["#e42268", "#fb8075", "#761871", "#5b7d9c", "#a38cb4", "#476590"],
  ['#f9b4ab', '#679186', '#fdebd3', '#264e70', '#bbd4ce'],
  ['#1f306e', '#c7417b', '#553772', '#8f3b76', '#f5487f'],
  ['#e0f0ea', '#95adbe', '#574f7d', '#503a65', '#3c2a4d'],
  ['#413e4a', '#b38184', '#73626e', '#f0b49e', '#f7e4be'],
  ['#ff4e50', '#fc913a', '#f9d423', '#ede574', '#e1f5c4'],
  ['#99b898', '#fecea8', '#ff847c', '#e84a5f', '#2a363b'],
  ['#69d2e7', '#a7dbd8', '#e0e4cc', '#f38630', '#fa6900'],
  ['#fe4365', '#fc9d9a', '#f9cdad', '#c8c8a9', '#83af9b'],
  ['#ecd078', '#d95b43', '#c02942', '#542437', '#53777a'],
  ['#556270', '#4ecdc4', '#c7f464', '#ff6b6b', '#c44d58'],
  ['#774f38', '#e08e79', '#f1d4af', '#ece5ce', '#c5e0dc'],
  ['#e8ddcb', '#cdb380', '#036564', '#033649', '#031634'],
  ['#490a3d', '#bd1550', '#e97f02', '#f8ca00', '#8a9b0f'],
  ['#594f4f', '#9de0ad', '#547980', '#45ada8', '#e5fcc2'],
  ['#00a0b0', '#cc333f', '#6a4a3c', '#eb6841', '#edc951'],
  ['#5bc0eb', '#fde74c', '#9bc53d', '#e55934', '#fa7921'],
  ['#ed6a5a', '#9bc1bc', '#f4f1bb', '#5ca4a9', '#e6ebe0'],
  ['#ef476f', '#ffd166', '#06d6a0', '#118ab2', '#073b4c'],
  ['#22223b', '#c9ada7', '#4a4e69', '#9a8c98', '#f2e9e4'],
  ['#114b5f', '#1a936f', '#88d498', '#c6dabf', '#f3e9d2'],
  ['#3d5a80', '#98c1d9', '#e0fbfc', '#ee6c4d', '#293241'],
  ['#06aed5', '#f0c808', '#086788', '#fff1d0', '#dd1c1a'],
  ['#540d6e', '#ee4266', '#ffd23f', '#3bceac', '#0ead69'],
  ['#c9cba3', '#e26d5c', '#ffe1a8', '#723d46', '#472d30'],
  ["#3c4cad", "#5FB49C", "#e8a49c"],
  ["#1c3560", "#ff6343", "#f2efdb", "#fea985"],
  ["#e0d7c5", "#488a50", "#b59a55", "#bf5513", "#3b6fb6", "#4f3224", "#9a7f6e"], //o-ball
  ["#DEEFB7", "#5FB49C", "#ed6a5a"],
  ["#2B2B2B", "#91B3E1", "#2F5FB3", "#3D4B89", "#AE99E8", "#DBE2EC"], //clipper_tea.snore&peace.
  ["#ffbe0b", "#fb5607", "#ff006e", "#8338ec", "#3a86ff"],
  ["#A8C25D", "#5B7243", "#FFA088", "#FFFB42", "#a9cff0", "#2D6EA6"], //2025/07/08
  ["#F9F9F1",  "#191A18","#E15521", "#3391CF", "#E4901C", "#F5B2B1", "#009472"]//reference :: @posterlad :: https://x.com/posterlad/status/1963188864446566493
];

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    // canvas 位置固定，選單寬度仍然使用 menuWidth（若需在 resize 時調整可在此處更新）
    let realMenu = select('.side-menu');
    if (realMenu) realMenu.style('height', windowHeight + 'px');

    // 若 iframe 有顯示，更新尺寸
    if (iframeInner) {
      let w = int(windowWidth * 0.7);
      let h = int(windowHeight * 0.85);
      iframeInner.style('width', w + 'px');
      iframeInner.style('height', h + 'px');
    }
}

// 顯示 iframe 覆蓋層（修正版）
function showIframe() {
  if (iframeOverlay) return; // 已顯示就跳過

  // 建立遮罩容器
  iframeOverlay = createDiv();
  iframeOverlay.id('iframeOverlay');
  iframeOverlay.parent(document.body);
  iframeOverlay.style('position','fixed');
  iframeOverlay.style('left','0px');
  iframeOverlay.style('top','0px');
  iframeOverlay.style('width','100%');
  iframeOverlay.style('height','100%');
  iframeOverlay.style('display','flex');
  iframeOverlay.style('align-items','center');
  iframeOverlay.style('justify-content','center');
  iframeOverlay.style('background','rgba(0,0,0,0.6)');
  iframeOverlay.style('z-index','10001');

  // 內框（白底）及 iframe
  iframeInner = createDiv();
  iframeInner.parent(iframeOverlay);
  iframeInner.style('position','relative');
  iframeInner.style('background','#ffffff');
  iframeInner.style('box-shadow','0 10px 40px rgba(0,0,0,0.6)');
  iframeInner.style('border-radius','6px');
  iframeInner.style('overflow','hidden');

  // 設定尺寸（70% 寬，85% 高）
  let w = int(windowWidth * 0.7);
  let h = int(windowHeight * 0.85);
  iframeInner.style('width', w + 'px');
  iframeInner.style('height', h + 'px');

  // 建立 iframe 元素
  let ifr = createElement('iframe');
  ifr.attribute('src', iframeURL);
  ifr.attribute('frameborder', '0');
  ifr.attribute('allowfullscreen', '');
  ifr.style('width','100%');
  ifr.style('height','100%');
  ifr.style('display','block');
  ifr.parent(iframeInner);

  // 關閉按鈕
  let closeBtn = createButton('✕');
  closeBtn.parent(iframeInner);
  closeBtn.style('position','absolute');
  closeBtn.style('right','8px');
  closeBtn.style('top','8px');
  closeBtn.style('z-index','10002');
  closeBtn.style('background','rgba(0,0,0,0.5)');
  closeBtn.style('color','#fff');
  closeBtn.style('border','none');
  closeBtn.style('padding','6px 10px');
  closeBtn.style('font-size','18px');
  closeBtn.style('border-radius','4px');
  closeBtn.mousePressed(() => { hideIframe(); });

  // 當點擊遮罩（但非內框）時也關閉
  iframeOverlay.elt.addEventListener('click', (e) => {
    if (!iframeInner) return;
    if (!iframeInner.elt.contains(e.target)) {
      hideIframe();
    }
  });

  // 防止內框點擊冒泡（可選）
  iframeInner.elt.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // 將 canvas z-index 調低，確保遮罩顯示在最上層
  let cv = select('canvas');
  if (cv) cv.style('z-index','0');
}

// 隱藏並移除 iframe 覆蓋層（修正版）
function hideIframe() {
  if (!iframeOverlay) return;
  iframeOverlay.remove();
  iframeOverlay = null;
  iframeInner = null;
  // 還原 canvas z-index（如需要）
  let cv = select('canvas');
  if (cv) cv.style('z-index','0');
}
