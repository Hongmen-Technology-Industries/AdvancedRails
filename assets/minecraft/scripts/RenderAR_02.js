var renderClass = "jp.ngt.rtm.render.RailPartsRenderer";
importPackage(Packages.org.lwjgl.opengl);
importPackage(Packages.jp.ngt.rtm.render);
importPackage(Packages.jp.ngt.rtm.rail.util);
importPackage(Packages.jp.ngt.ngtlib.util);
importPackage(Packages.jp.ngt.rtm);
var currentRailIndexField;

function init(par1, par2) {
  Base = renderer.registerParts(new Parts("Base"));
  End = renderer.registerParts(new Parts("End"));
  wall = [];
  for (var j = 1; j <= 8; j++) {
    wall.push(renderer.registerParts(new Parts("Ba" + j.toString())));
  }
}

function renderRailStatic(tileEntity, posX, posY, posZ, par8, pass) {
  var index = this.getCurrentRailIndex();
  renderRailStatic2(tileEntity, posX, posY, posZ, index);
}

function renderRailDynamic(tileEntity, posX, posY, posZ, par8, pass) {
  return;
}

function shouldRenderObject(tileEntity, objName, len, pos) {
  return false;
}

function renderRailStatic2(tileEntity, par2, par4, par6, index) {
  if (renderer.isSwitchRail(tileEntity)) {
    return;
  } else {
    GL11.glPushMatrix();

    var rp = tileEntity.getRailPositions()[0];
    var x = rp.posX - rp.blockX;
    var y = rp.posY - rp.blockY;
    var z = rp.posZ - rp.blockZ;
    var modelName = this.getBaseRailName(tileEntity);
    GL11.glTranslatef(par2 + x, par4 + y - 0.0625, par6 + z);

    renderer.bindTexture(
      renderer.getModelObject().textures[0].material.texture
    );

    var rm2 = tileEntity.getRailMap(null);
    var railLength = rm2.getLength();
    var max = Math.floor(railLength * 2);
    var origPos = rm2.getRailPos(max, 0);
    var origHeight = rm2.getRailHeight(max, 0);
    var origCant = rm2.getCant(max, 0);
    var origCantRad = origCant * (Math.PI / 180);
    var origCantHeigt = 1.5 * Math.abs(Math.sin(origCantRad));
    var sLen = railLength / max;
    var scale = sLen * 2;

    for (var i = 0; i <= max; ++i) {
      var wpos = i % 8;
      var p1 = rm2.getRailPos(max, i);
      var y0 = rm2.getRailHeight(max, i) - origHeight + origCantHeigt;
      var x0 = p1[1] - origPos[1];
      var z0 = p1[0] - origPos[0];
      var roll = rm2.getCant(max, i);
      var yaw = rm2.getRailRotation(max, i);
      var pitch = rm2.getRailPitch(max, i) * -1;
      var yawRad = yaw * (Math.PI / 180);
      var yawSin = Math.sin(yawRad);
      var yawCos = Math.cos(yawRad);
      var brightness = renderer.getBrightness(
        renderer.getWorld(tileEntity),
        p1[1],
        renderer.getY(tileEntity),
        p1[0]
      );
      renderer.setBrightness(brightness);
      GL11.glPushMatrix();

      GL11.glTranslatef(x0, y0, z0);
      GL11.glRotatef(yaw, 0.0, 1.0, 0.0);
      GL11.glRotatef(pitch, 1.0, 0.0, 0.0);
      GL11.glRotatef(roll, 0.0, 0.0, 1.0);
      if (this.isRightRail(tileEntity, index)) {
        GL11.glRotatef(180, 0.0, 1.0, 0.0);
      }
      Base.render(renderer);
      wall[wpos].render(renderer);
      if (i == 0 || i == max) {
        End.render(renderer);
      }
      GL11.glPopMatrix();
    }
    GL11.glPopMatrix();
  }
}

function isLegacy() {
  return RTMCore.VERSION.indexOf("1.7.10") > -1;
}

function getCurrentRailIndex() {
  if (currentRailIndexField === undefined) {
    currentRailIndexField = (
      isLegacy() ? RailPartsRenderer.class : RailPartsRendererBase.class
    ).getDeclaredField("currentRailIndex");
    currentRailIndexField.setAccessible(true);
  }
  return currentRailIndexField.get(renderer);
}

function isRightRail(tileEntity, index) {
  if (index === 0) {
    return this.getBaseRailName(tileEntity).contains("_R");
  } else {
    var subRail = tileEntity.subRails.get(index - 1);
    return this.getRailName(subRail).contains("_R");
  }
}

function getBaseRailName(tileEntity) {
  return this.isLegacy()
    ? tileEntity.getProperty().railModel
    : tileEntity.getResourceState().getResourceName();
}

function getRailName(rs) {
  return this.isLegacy() ? rs.railModel : rs.getResourceName();
}
