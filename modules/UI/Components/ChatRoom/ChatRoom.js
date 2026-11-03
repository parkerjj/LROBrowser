define(
  "UI/Components/ChatRoom/ChatRoom",
  "require Core/Preferences Utils/jquery Renderer/Renderer Engine/SessionStorage Controls/MouseEventHandler Controls/KeyEventHandler UI/Components/ChatBox/ChatBox UI/UIManager UI/UIComponent text!./ChatRoom.html text!./ChatRoom.css".split(
    " ",
  ),
  function (a) {
    function b() {
      var a = u.ui,
        b = a.find(".send input[name\x3dmessage]").val();
      if (1 > b.length) return !1;
      if ("/" === b[0])
        return (
          q("Controls/ProcessCommand").call(g, b.substr(1)),
          a.find(".send input[name\x3dmessage]").val(""),
          !0
        );
      if (isRestricted)
        p.showMessageBox(
          "You are temporarily restricted from sending data.",
          "ok",
        );
      else if (
        (sendCount++,
        1 === sendCount &&
          setTimeout(function () {
            sendCount = 0;
          }, timeFrame),
        sendCount > sendLimit)
      )
        ((isRestricted = !0),
          p.showMessageBox(
            "Send limit exceeded. You are restricted for 10s.",
            "ok",
          ),
          setTimeout(function () {
            isRestricted = !1;
            p.showMessageBox(
              "Restriction lifted. You can send data again.",
              "ok",
            );
          }, restrictionDuration));
      else
        return (
          g.onRequestTalk("", b),
          a.find(".send input[name\x3dmessage]").val(""),
          !0
        );
    }
    function c() {
      var a = u.ui,
        b = a.position().top,
        c = a.position().left,
        e = 0,
        f = 0,
        g;
      g = setInterval(function () {
        var a = Math.floor((r.screen.x - c - 25) / 32),
          g = Math.floor((r.screen.y - b - 20) / 32),
          a = Math.min(Math.max(a, 7), 14),
          g = Math.min(Math.max(g, 3), 8);
        if (a !== e || g !== f) (d(a, g), (e = a), (f = g));
      }, 30);
      m(window).one("mouseup", function (a) {
        1 === a.which && clearInterval(g);
      });
    }
    function d(a, b) {
      a = Math.min(Math.max(a, 7), 14);
      b = Math.min(Math.max(b, 3), 8);
      u.ui.css("width", 55 + 32 * a);
      u.ui.find(".resize").css("height", 32 * b);
    }
    var e = a("Core/Preferences"),
      m = a("Utils/jquery"),
      h = a("Renderer/Renderer"),
      t = a("Engine/SessionStorage"),
      r = a("Controls/MouseEventHandler"),
      n = a("Controls/KeyEventHandler"),
      g = a("UI/Components/ChatBox/ChatBox"),
      p = a("UI/UIManager"),
      l = a("UI/UIComponent"),
      f = a("text!./ChatRoom.html"),
      k = a("text!./ChatRoom.css"),
      q = a,
      u = new l("ChatRoom", f, k);
    u.title = "";
    u.limit = 20;
    u.type = 0;
    u.count = 0;
    u.members = [];
    u.owner = "";
    u.isOpen = !1;
    var v = e.get("ChatRoom", { x: 480, y: 200, width: 7, height: 4 }, 1);
    u.init = function () {
      this.ui.find(".extend").mousedown(c);
      this.ui
        .find(".close")
        .mousedown(function (a) {
          a.stopImmediatePropagation();
          return !1;
        })
        .click(this.remove.bind(this));
      this.ui.find(".sendmsg").mousedown(function (a) {
        a.stopImmediatePropagation();
      });
      this.draggable(this.ui.find(".titlebar"));
    };
    u.onAppend = function () {
      this.isOpen = !0;
      d(v.width, v.height);
      this.ui.css({
        top: Math.min(Math.max(0, v.y), h.height - this.ui.height()),
        left: Math.min(Math.max(0, v.x), h.width - this.ui.width()),
      });
      this.ui.find(".sendmsg").focus();
      this.updateChat();
    };
    u.onRemove = function () {
      this.title = "";
      this.limit = 20;
      this.count = this.type = 0;
      this.members.length = 0;
      this.owner = "";
      this.isOpen = !1;
      this.ui.find(".messages").empty();
      v.y = parseInt(this.ui.css("top"), 10);
      v.x = parseInt(this.ui.css("left"), 10);
      v.width = Math.floor((this.ui.width() - 25) / 32);
      v.height = Math.floor((this.ui.height() - -30) / 32);
      v.save();
      this.exitRoom();
    };
    u.updateChat = function () {
      var a = "",
        b,
        c = this.members.length;
      this.ui.find(".titlebar .title").text(this.title);
      this.ui.find(".titlebar .count").text(this.count + "/" + this.limit);
      for (b = 0; b < c; ++b)
        a =
          this.members[b] == this.owner
            ? '\x3cspan class\x3d"owner"\x3e' +
              m.escape(this.members[b]) +
              "\x3c/span\x3e\x3cbr/\x3e" +
              a
            : a + (m.escape(this.members[b]) + "\x3cbr/\x3e");
      this.ui.find(".members").html(a);
    };
    u.message = function (a, b) {
      var c = m("\x3cdiv/\x3e");
      c.text(a);
      b
        ? c.addClass(b)
        : 0 === a.indexOf(t.Entity.display.name + " : ") && c.addClass("self");
      a = this.ui.find(".messages");
      a.append(c);
      a[0].scrollTop = a[0].scrollHeight;
      return !0;
    };
    u.removeMember = function (a) {
      a = this.members.indexOf(a);
      return -1 < a ? (this.members.splice(a, 1), !0) : !1;
    };
    u.onKeyDown = function (a) {
      return a.which === n.ENTER ? (b(), a.stopImmediatePropagation(), !1) : !0;
    };
    u.exitRoom = function () {};
    return p.addComponent(u);
  },
);
