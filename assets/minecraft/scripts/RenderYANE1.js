var renderClass = "jp.ngt.rtm.render.RailPartsRenderer";
importPackage(Packages.org.lwjgl.opengl);
importPackage(Packages.jp.ngt.rtm.render);
importPackage(Packages.jp.ngt.rtm.rail.util);
importPackage(Packages.jp.ngt.ngtlib.renderer);

function init(par1, par2) {
  allParts = renderer.registerParts(new Parts("Pillar", "obj1"));
  Light = renderer.registerParts(new Parts("Lights"));
}

function renderRailStatic(tileEntity, posX, posY, posZ, par8, pass) {
  renderRailStatic2(tileEntity, posX, posY, posZ);
  renderer.renderStaticParts(tileEntity, posX, posY, posZ);
}

function renderRailDynamic(tileEntity, posX, posY, posZ, par8, pass) {}

function shouldRenderObject(tileEntity, objName, len, pos) {
  if (pos % 18 == 0 && objName === "Pillar") {
    return true;
  }
  if (objName === "obj1") {
    return true;
  }
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

    for (var i = 0; i <= max; ++i) {
      var Lpos = i % 5;
      var p1 = rm2.getRailPos(max, i);
      var y0 = rm2.getRailHeight(max, i) - origHeight;
      var x0 = p1[1] - origPos[1];
      var z0 = p1[0] - origPos[0];
      var yaw = rm2.getRailRotation(max, i);
      var pitch = rm2.getRailPitch(max, i) * -1;
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
      renderer.setBrightness(240);
      if (Lpos == 0) {
        Light.render(renderer);
      }
      GL11.glPopMatrix();
    }
    GL11.glPopMatrix();
  }
}
