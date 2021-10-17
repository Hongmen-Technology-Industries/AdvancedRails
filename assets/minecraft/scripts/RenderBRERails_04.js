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
  anchorL = renderer.registerParts(new Parts("anchorL"));
  anchorR = renderer.registerParts(new Parts("anchorR"));
}

function renderRailStatic(tileEntity, posX, posY, posZ, par8, pass) {
  renderRailStatic2(tileEntity, posX, posY, posZ);
  renderer.renderStaticParts(tileEntity, posX, posY, posZ);
}

function renderRailDynamic(tileEntity, posX, posY, posZ, par8, pass) {
  return false;
}

function shouldRenderObject(tileEntity, objName, len, pos) {
  return false;
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
    var max = Math.floor(railLength * 2.0);
    var origPos = rm2.getRailPos(max, 0);
    var origHeight = rm2.getRailHeight(max, 0);
    var origCant = rm2.getCant(max, 0);
    var origCantRad = origCant * (Math.PI / 180);
    var origCantHeigt = 1.5 * Math.abs(Math.sin(origCantRad));

    for (var i = 0; i <= max; ++i) {
      var p1 = rm2.getRailPos(max, i);
      var y0 = rm2.getRailHeight(max, i) - origHeight;
      var y0 = rm2.getRailHeight(max, i) - origHeight + origCantHeigt;
      var x0 = p1[1] - origPos[1];
      var z0 = p1[0] - origPos[0];
      var roll = rm2.getCant(max, i);
      var yaw = rm2.getRailRotation(max, i);
      var pitch = rm2.getRailPitch(max, i) * -1;
      var yaw2 = i == max ? yaw : rm2.getRailRotation(max, i + 1);
      var yaw3 = yaw2 - yaw;
      var brightness = renderer.getBrightness(
        renderer.getWorld(tileEntity),
        p1[1],
        renderer.getY(tileEntity),
        p1[0]
      );

      GL11.glPushMatrix();
      GL11.glTranslatef(x0, y0, z0);
      GL11.glRotatef(yaw, 0.0, 1.0, 0.0);
      GL11.glRotatef(pitch, 1.0, 0.0, 0.0);
      GL11.glRotatef(roll, 0.0, 0.0, 1.0);
      renderer.setBrightness(brightness);
      if (yaw3 >= 0.005 && i % 10 == 1) {
        anchorR.render(renderer);
      }
      if (yaw3 <= -0.005 && i % 10 == 1) {
        anchorL.render(renderer);
      }
      GL11.glPopMatrix();
    }
    GL11.glPopMatrix();
  }
}

function sigmoid2(x) {
  var d0 = x * 3.5;
  var d1 = d0 / Math.sqrt(1.0 + d0 * d0); //シグモイド関数
  return d1 * 0.75 + 0.25;
}
