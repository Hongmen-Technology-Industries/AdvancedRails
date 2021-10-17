var renderClass = "jp.ngt.rtm.render.RailPartsRenderer";
importPackage(Packages.org.lwjgl.opengl);
importPackage(Packages.jp.ngt.rtm.render);

function init(par1, par2) {
  allParts = renderer.registerParts(new Parts("obj1", "obj2"));
}

function renderRailStatic(tileEntity, posX, posY, posZ, par8, pass) {
  renderer.renderStaticParts(tileEntity, posX, posY, posZ);
}

function renderRailDynamic(tileEntity, posX, posY, posZ, par8, pass) {}

function shouldRenderObject(tileEntity, objName, len, pos) {
  if (pos % 3 == 0 && objName === "obj1") {
    return true;
  } else if (objName === "obj2") {
    return true;
  }

  return false;
}
