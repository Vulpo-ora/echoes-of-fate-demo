/* ✦ 命定·回响 — 全局点击星光特效
   规则：除了在输入框里打字（键盘输入）不产生星光外，页面上每一次鼠标/触摸点击都迸发一簇星光。
   用法：页面里放一个 <canvas id="sparkLayer" ...pointer-events:none> 再 <script src="starfx.js">。
   若没有该 canvas，会自动创建一个。 */
(function(){
  var cv = document.getElementById('sparkLayer');
  if(!cv){
    cv = document.createElement('canvas');
    cv.id = 'sparkLayer';
    cv.style.cssText = 'position:fixed;inset:0;z-index:9999;pointer-events:none;';
    document.body.appendChild(cv);
  }
  var ctx = cv.getContext('2d');
  var W, H, DPR = Math.min(window.devicePixelRatio || 1, 2);
  function resize(){
    W = cv.width = Math.floor(innerWidth * DPR);
    H = cv.height = Math.floor(innerHeight * DPR);
    cv.style.width = innerWidth + 'px';
    cv.style.height = innerHeight + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  resize();
  addEventListener('resize', resize);

  var parts = [];       // 迸发的星尘粒子
  var stars = [];       // 五角星闪光
  var COLORS = ['#cfe0ff', '#a9bcff', '#ffffff', '#8fa8ff', '#e6ecff'];

  function pick(){ return COLORS[(Math.random()*COLORS.length)|0]; }

  // 画一颗五角星
  function drawStar(x, y, r, rot, alpha, color){
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    for(var i=0;i<5;i++){
      var a = -Math.PI/2 + i*2*Math.PI/5;
      var ox = Math.cos(a)*r, oy = Math.sin(a)*r;
      i===0 ? ctx.moveTo(ox,oy) : ctx.lineTo(ox,oy);
      var a2 = a + Math.PI/5;
      ctx.lineTo(Math.cos(a2)*r*0.45, Math.sin(a2)*r*0.45);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.restore();
  }

  function burst(x, y){
    // 中心一颗主星 + 若干小星尘飞散
    var n = 10 + (Math.random()*6|0);
    for(var i=0;i<n;i++){
      var ang = Math.random()*Math.PI*2;
      var sp = 1.5 + Math.random()*4.5;
      parts.push({
        x:x, y:y,
        vx:Math.cos(ang)*sp, vy:Math.sin(ang)*sp - 0.6,
        r:1 + Math.random()*2.2,
        life:1, decay:0.018 + Math.random()*0.02,
        color:pick()
      });
    }
    var m = 2 + (Math.random()*2|0);
    for(var j=0;j<m;j++){
      stars.push({
        x:x + (Math.random()*20-10), y:y + (Math.random()*20-10),
        r:6 + Math.random()*8, rot:Math.random()*Math.PI,
        vr:(Math.random()*0.2-0.1),
        life:1, decay:0.03 + Math.random()*0.02,
        color:pick()
      });
    }
    if(!running){ running=true; requestAnimationFrame(loop); }
  }

  var running = false;
  function loop(){
    ctx.clearRect(0,0,innerWidth,innerHeight);
    for(var i=parts.length-1;i>=0;i--){
      var p = parts[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.vx *= 0.98;
      p.life -= p.decay;
      if(p.life<=0){ parts.splice(i,1); continue; }
      ctx.save();
      ctx.globalAlpha = Math.max(p.life,0);
      var g = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*3);
      g.addColorStop(0, p.color);
      g.addColorStop(1, 'rgba(150,180,255,0)');
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r*3,0,Math.PI*2);
      ctx.fillStyle = g; ctx.fill();
      ctx.restore();
    }
    for(var k=stars.length-1;k>=0;k--){
      var s = stars[k];
      s.rot += s.vr; s.y -= 0.4; s.life -= s.decay;
      if(s.life<=0){ stars.splice(k,1); continue; }
      drawStar(s.x, s.y, s.r*(0.6+0.4*s.life), s.rot, Math.max(s.life,0), s.color);
    }
    if(parts.length || stars.length){ requestAnimationFrame(loop); }
    else { running=false; ctx.clearRect(0,0,innerWidth,innerHeight); }
  }

  // 每一次点击/触摸都迸发（打字不触发——我们只监听指针事件，不监听键盘）
  function onTap(e){
    var pt = (e.touches && e.touches[0]) ? e.touches[0] : e;
    if(pt.clientX==null) return;
    burst(pt.clientX, pt.clientY);
  }
  document.addEventListener('pointerdown', onTap, {passive:true});
})();
