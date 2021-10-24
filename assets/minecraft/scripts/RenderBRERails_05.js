var renderClass = "jp.ngt.rtm.render.RailPartsRenderer";
importPackage(Packages.org.lwjgl.opengl);
importPackage(Packages.jp.ngt.rtm.render);
importPackage(Packages.jp.ngt.rtm.rail.util);

TONG_MOVE = 0.35;
TONG_POS = 1.0 / 7.0;
HALF_GAUGE = 0.5647;
/**レール長で割る*/
YAW_RATE = 450.0;

function init(par1, par2) {
  Pcs = renderer.registerParts(new Parts("Pcs"));
  fixtureL = renderer.registerParts(new Parts("FiL"));
  fixtureR = renderer.registerParts(new Parts("FiR"));
  leftParts = renderer.registerParts(new Parts("RaL", "sideL"));
  rightParts = renderer.registerParts(new Parts("RaR", "sideR"));
  start = renderer.registerParts(new Parts("start"));
  end = renderer.registerParts(new Parts("end"));
  tongFL = renderer.registerParts(new Parts("TLF"));
  tongBL = renderer.registerParts(new Parts("TLB"));
  tongFR = renderer.registerParts(new Parts("TRF"));
  tongBR = renderer.registerParts(new Parts("TRB"));
  anchorL = renderer.registerParts(new Parts("anchorL"));
  anchorR = renderer.registerParts(new Parts("anchorR"));
}

function renderRailStatic(tileEntity, posX, posY, posZ, par8, pass) {
  renderRailStatic2(tileEntity, posX, posY, posZ);
  renderer.renderStaticParts(tileEntity, posX, posY, posZ);
}

function renderRailDynamic(tileEntity, posX, posY, posZ, par8, pass) {
  if (renderer.isSwitchRail(tileEntity)) {
    renderRailDynamic2(tileEntity, posX, posY, posZ);
  }
}

function shouldRenderObject(tileEntity, objName, len, pos) {
  if (renderer.isSwitchRail(tileEntity)) {
    if (Pcs.containsName(objName)) {
      return true;
    }
    return false;
  } else {
    var rm2 = tileEntity.getRailMap(null);
    var railLength = rm2.getLength();
    var max = Math.floor(railLength * 2.0);
    if (
      fixtureL.containsName(objName) ||
      fixtureR.containsName(objName) ||
      leftParts.containsName(objName) ||
      rightParts.containsName(objName)
    ) {
      return true;
    }
    if (start.containsName(objName) && pos == 0) {
      return true;
    } else if (end.containsName(objName) && pos == max) {
      return true;
    }
    return false;
  }
}

function renderRailStatic2(tileEntity, par2, par4, par6) {
  if (renderer.isSwitchRail(tileEntity)) {
    return 0;
  } else {
    GL11.glPushMatrix();

    var rp = tileEntity.getRailPositions()[0];
    var x = rp.posX - rp.blockX;
    var y = rp.posY - rp.blockY;
    var z = rp.posZ - rp.blockZ;
    GL11.glTranslatef(par2 + x, par4 + y - 0.0625, par6 + z);

    renderer.bindTexture(
      renderer.getModelObject().textures[0].material.texture
    );

    var rm2 = tileEntity.getRailMap(null);
    var railLength = rm2.getLength();
    var origPos = rm2.getRailPos(1, 0);
    var origHeight = rm2.getRailHeight(1, 0);
    var origCant = rm2.getCant(1, 0);
    var origCantRad = origCant * (Math.PI / 180);
    var origCantHeigt = 1.5 * Math.abs(Math.sin(origCantRad));
    var segmentMax = Math.ceil(railLength / 10); //レール全体のセグメント分割数
    var segmentLength = railLength / segmentMax; //セグメントの長さ
    var sleepermax0 = Math.floor(segmentLength * 2.5); //セグメントの枕木分割数
    var sleepermax1 = sleepermax0 * segmentMax; //レール全体の枕木分割数
    for (var i = 0; i <= segmentMax - 1; ++i) {
      var p0 = rm2.getRailPos(segmentMax, i); //i番目のセグメントの始点
      var p1 = rm2.getRailPos(segmentMax, i + 1); //i番目のセグメントの終点
      var x0 = p1[1] - p0[1]; //i番目のセグメントの長さX成分
      var z0 = p1[0] - p0[0]; //i番目のセグメントの長さZ成分
      for (var j = 0; j <= sleepermax0; ++j) {
        var sleeperOfset = i * sleepermax0; //i番目のセグメントより手前にある枕木の数
        var x1 = (j / sleepermax0) * x0; //i番目のセグメント内のj番目の枕木のX変位
        var z1 = (j / sleepermax0) * z0; //i番目のセグメント内のj番目の枕木のZ変位
        var x2 = p0[1] + x1 - origPos[1]; //i番目のセグメント内のj番目の枕木のローカルX座標
        var z2 = p0[0] + z1 - origPos[0]; //i番目のセグメント内のj番目の枕木のローカルZ座標
        var y2 =
          rm2.getRailHeight(sleepermax1, sleeperOfset + j) -
          origHeight +
          origCantHeigt;
        var roll = rm2.getCant(sleepermax1, sleeperOfset + j);
        var pitch = rm2.getRailPitch(sleepermax1, sleeperOfset + j) * -1;
        var yaw = (Math.atan(x0 / z0) * 180.0) / Math.PI;
        var brightness = renderer.getBrightness(
          renderer.getWorld(tileEntity),
          p1[1],
          renderer.getY(tileEntity),
          p1[0]
        );
        GL11.glPushMatrix();
        GL11.glTranslatef(x2, y2, z2);
        GL11.glRotatef(yaw, 0.0, 1.0, 0.0);
        GL11.glRotatef(pitch, 1.0, 0.0, 0.0);
        GL11.glRotatef(roll, 0.0, 0.0, 1.0);
        renderer.setBrightness(brightness);
        Pcs.render(renderer);
        GL11.glPopMatrix();
      }
    }
    GL11.glPopMatrix();
  }
}

function renderRailDynamic2(tileEntity, par2, par4, par6) {
  if (tileEntity.getSwitch() == null) {
    return;
  }

  GL11.glPushMatrix();
  var rp = tileEntity.getRailPositions()[0];
  var x = rp.posX - rp.blockX;
  var y = rp.posY - rp.blockY;
  var z = rp.posZ - rp.blockZ;
  GL11.glTranslatef(par2 + x, par4, par6 + z);

  renderer.bindTexture(renderer.getModelObject().textures[0].material.texture);

  //分岐レールの各頂点-中間点までを描画
  var pArray = tileEntity.getSwitch().getPoints();
  for (var i = 0; i < pArray.length; ++i) {
    renderPoint(tileEntity, pArray[i]);
  }

  GL11.glPopMatrix();
}

function renderPoint(tileEntity, point) {
  if (point.branchDir == RailDir.NONE) {
    //分岐なし部分
    var rm = point.rmMain;
    var max = Math.floor(rm.getLength() * 2.0);
    var halfMax = Math.floor((max * 4) / 5);
    var startIndex = point.mainDirIsPositive ? 0 : halfMax;
    var endIndex = point.mainDirIsPositive ? halfMax : max;
    renderer.renderRailMapStatic(
      tileEntity,
      rm,
      max,
      startIndex,
      endIndex,
      leftParts,
      rightParts,
      fixtureR,
      fixtureL
    );
  } else {
    var tongIndex = Math.floor(point.rmMain.getLength() * 2.0 * TONG_POS); //どの位置を末端モデルで描画
    var move = point.getMovement() * TONG_MOVE;
    renderRailMapDynamic(
      tileEntity,
      point.rmMain,
      point.branchDir,
      point.mainDirIsPositive,
      move,
      tongIndex
    );

    move = (1.0 - point.getMovement()) * TONG_MOVE;
    renderRailMapDynamic(
      tileEntity,
      point.rmBranch,
      point.branchDir.invert(),
      point.branchDirIsPositive,
      move,
      tongIndex
    );
  }
}

/**
 * RailMapごとの描画
 * @param move 開通時:0.0
 */
function renderRailMapDynamic(tileEntity, rms, dir, par3, move, tongIndex) {
  var railLength = rms.getLength();
  var max = Math.floor(railLength * 2.0);
  var halfMax = Math.floor((max * 4) / 5);
  var startIndex = par3 ? 0 : halfMax;
  var endIndex = par3 ? halfMax : max;

  var origPos = rms.getRailPos(max, 0);
  var startPos = tileEntity.getStartPoint();
  var revXZ = RailPosition.REVISION[tileEntity.getRailPositions()[0].direction];
  //当RailMapのレール全体の始点に対する移動差分
  var coreX = startPos[0] + 0.5 + revXZ[0];
  var coreZ = startPos[2] + 0.5 + revXZ[1];
  var moveX = origPos[1] - coreX;
  var moveZ = origPos[0] - coreZ;
  //向きによって移動量を反転させる
  var dirFixture =
    (par3 && dir == RailDir.LEFT) || (!par3 && dir == RailDir.RIGHT)
      ? -1.0
      : 1.0;

  //頂点-中間点
  for (var i = startIndex; i <= endIndex; ++i) {
    var p1 = rms.getRailPos(max, i);
    var x0 = moveX + (p1[1] - origPos[1]);
    var z0 = moveZ + (p1[0] - origPos[0]);
    var yaw = rms.getRailRotation(max, i);
    var brightness = renderer.getBrightness(
      renderer.getWorld(tileEntity),
      p1[1],
      renderer.getY(tileEntity),
      p1[0]
    );

    GL11.glPushMatrix();
    GL11.glTranslatef(x0, 0.0, z0);
    GL11.glRotatef(yaw, 0.0, 1.0, 0.0);
    renderer.setBrightness(brightness);

    //分岐してない側のレール
    //開始位置が逆の場合は左右反対側のパーツを描画
    if ((par3 && dir == RailDir.LEFT) || (!par3 && dir == RailDir.RIGHT)) {
      rightParts.render(renderer);
      fixtureR.render(renderer);
    } else {
      leftParts.render(renderer);
      fixtureL.render(renderer);
    }

    //トング部分の離れ度合い(0.0-1.0)
    var separateRate = (par3 ? i : max - i) / halfMax;
    separateRate = (1.0 - sigmoid2(separateRate)) * move * dirFixture;
    var halfGaugeMove = dirFixture * HALF_GAUGE;
    GL11.glTranslatef(separateRate - halfGaugeMove, 0.0, 0.0);
    var yaw2 = ((separateRate * YAW_RATE) / railLength) * (par3 ? -1.0 : 1.0);
    GL11.glRotatef(yaw2, 0.0, 1.0, 0.0);
    GL11.glTranslatef(halfGaugeMove, 0.0, 0.0);

    //分岐してる側のレール
    if (dir == RailDir.LEFT) {
      if (par3) {
        //始点を共有
        if (i == tongIndex) {
          tongBL.render(renderer); //トングレール
        } else if (i > tongIndex) {
          leftParts.render(renderer); //リードレール
          fixtureL.render(renderer);
        }
      } //終点を共有
      else {
        if (i == max - tongIndex) {
          tongFR.render(renderer); //トングレール
        } else if (i < max - tongIndex) {
          rightParts.render(renderer); //リードレール
          fixtureR.render(renderer);
        }
      }
    } //dir == RailDir.RIGHT
    else {
      if (par3) {
        //始点を共有
        if (i == tongIndex) {
          tongBR.render(renderer); //トングレール
        } else if (i > tongIndex) {
          rightParts.render(renderer); //リードレール
          fixtureR.render(renderer);
        }
      } //終点を共有
      else {
        if (i == max - tongIndex) {
          tongFL.render(renderer); //トングレール
        } else if (i < max - tongIndex) {
          leftParts.render(renderer); //リードレール
          fixtureL.render(renderer);
        }
      }
    }

    GL11.glPopMatrix();
  }
}

function sigmoid2(x) {
  var d0 = x * 3.5;
  var d1 = d0 / Math.sqrt(1.0 + d0 * d0); //シグモイド関数
  return d1 * 0.75 + 0.25;
}
