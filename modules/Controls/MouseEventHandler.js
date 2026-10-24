define("Controls/MouseEventHandler", ["Utils/jquery"], function (a) {
  var b = {
    screen: { x: -1, y: -1, width: 0, height: 0 },
    world: { x: -1, y: -1, z: -1 },
    intersect: !1,
    MOUSE_STATE: { NORMAL: 0, DRAGGING: 1, USESKILL: 2 },
    state: 0,
  };
  a(window).mousemove(function (a) {
    b.screen.x = a.pageX;
    b.screen.y = a.pageY;
  });
  return b;
});
