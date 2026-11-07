define(
  "UI/Components/WinLogin/WinLogin",
  "require Engine/SessionStorage Utils/jquery DB/DBManager Core/Client Core/Preferences Core/Configs Renderer/Renderer Controls/KeyEventHandler UI/UIManager UI/UIComponent text!./WinLogin.html text!./WinLogin.css".split(
    " ",
  ),
  function (a) {
    function b() {
      l.onExitRequest();
      return !1;
    }
    function c() {
      if (B) return !1;
      B = !0;
      var a = n.val(),
        b = p.val();
      if (!a || !b) return (B = !1);
      f.saveID
        ? ((f.saveID = !0), (f.ID = a), (f.PD = b))
        : ((f.saveID = !1), (f.ID = ""), (f.PD = ""));
      f.save();
      uid = a;
      psd = b;
      window.scrollTo(0, 0);
      e("#body-cover").hasClass("input") &&
        e("#body-cover").removeClass("input");
      d.Character = null;
      var c = e("#_csrf").val(),
        g = r.get("ClientVer"),
        h;
      switch (g) {
        case 3:
          h = {
            _csrf: c,
            "Login_cn2[userid]": uid,
            "Login_cn2[user_pass]": psd,
          };
          break;
        case 4:
          h = { _csrf: c, "Login_ts[userid]": uid, "Login_ts[user_pass]": psd };
          break;
        case 5:
          h = {
            _csrf: c,
            "Login_debug[userid]": uid,
            "Login_debug[user_pass]": psd,
          };
      }
      e.ajax({
        url: "/?r\x3dmg/check\x26nid\x3d" + g,
        type: "post",
        data: h,
        success: function (c) {
          if (3 == c)
            k.showMessageBox(
              "\u767b\u5f55\u7ec8\u7aef\u8d85\u9650",
              "ok",
              null,
            );
          else l.onConnectionRequest(a, b);
          B = !1;
        },
      });
      return !1;
    }
    var d = a("Engine/SessionStorage"),
      e = a("Utils/jquery"),
      m = a("DB/DBManager");
    a("Core/Client");
    var h = a("Core/Preferences"),
      r = a("Core/Configs");
    a("Renderer/Renderer");
    var q = a("Controls/KeyEventHandler"),
      k = a("UI/UIManager"),
      g = a("UI/UIComponent"),
      t = a("text!./WinLogin.html");
    a = a("text!./WinLogin.css");
    var l = new g("WinLogin", t, a),
      f = h.get("WinLogin", { saveID: !0, ID: "", PD: "" }, 1),
      n,
      p,
      v = r.get("ClientVer"),
      u = !1,
      A = {
        0: "\u521d\u5b66\u8005",
        1: "\u5251\u58eb",
        2: "\u9b54\u6cd5\u5e08",
        3: "\u5f13\u7bad\u624b",
        4: "\u670d\u4e8b",
        5: "\u5546\u4eba",
        6: "\u76d7\u8d3c",
        7: "\u9a91\u58eb",
        8: "\u7267\u5e08",
        9: "\u5deb\u5e08",
        10: "\u94c1\u5320",
        11: "\u730e\u4eba",
        12: "\u523a\u5ba2",
        13: "\u9a91\u58eb",
        14: "\u5341\u5b57\u519b",
        15: "\u6b66\u50e7",
        16: "\u8d24\u8005",
        17: "\u6d41\u6c13",
        18: "\u70bc\u91d1\u672f\u58eb",
        19: "\u8bd7\u4eba",
        20: "\u821e\u8005",
        21: "Crusader",
        23: "\u8d85\u521d",
        24: "\u5feb\u67aa\u624b",
        25: "\u5fcd\u8005",
        4001: "\u8fdb\u9636\u521d\u5b66\u8005",
        4002: "\u8fdb\u9636\u5251\u58eb",
        4003: "\u8fdb\u9636\u9b54\u6cd5\u5e08",
        4004: "\u8fdb\u9636\u5f13\u7bad\u624b",
        4005: "\u8fdb\u9636\u670d\u4e8b",
        4006: "\u8fdb\u9636\u5546\u4eba",
        4007: "\u8fdb\u9636\u76d7\u8d3c",
        4008: "\u9a91\u58eb\u9886\u4e3b",
        4009: "\u795e\u5b98",
        4010: "\u8d85\u9b54\u5bfc\u5e08",
        4011: "\u795e\u5de5\u5320",
        4012: "\u795e\u5c04\u624b",
        4013: "\u5341\u5b57\u523a\u5ba2",
        4014: "",
        4015: "\u5723\u6bbf\u5341\u5b57\u519b",
        4016: "\u6b66\u672f\u5b97\u5e08",
        4017: "\u667a\u8005",
        4018: "\u795e\u884c\u592a\u4fdd",
        4019: "\u521b\u9020\u8005",
        4020: "\u641e\u7b11\u827a\u4eba",
        4021: "\u51b7\u8273\u821e\u59ec",
        4022: "\u5723\u6bbf\u5341\u5b57\u519b",
        4023: "\u521d\u5fc3\u8005\uff08\u5b9d\u5b9d\uff09",
        4024: "\u5251\u58eb\uff08\u5b9d\u5b9d\uff09",
        4025: "\u9b54\u6cd5\u5e08\uff08\u5b9d\u5b9d\uff09",
        4026: "\u5f13\u7bad\u624b\uff08\u5b9d\u5b9d\uff09",
        4027: "\u670d\u4e8b\uff08\u5b9d\u5b9d\uff09",
        4028: "\u5546\u4eba\uff08\u5b9d\u5b9d\uff09",
        4029: "\u76d7\u8d3c\uff08\u5b9d\u5b9d\uff09",
        4030: "\u9a91\u58eb\uff08\u5b9d\u5b9d\uff09",
        4031: "\u7267\u5e08\uff08\u5b9d\u5b9d\uff09",
        4032: "\u5deb\u5e08\uff08\u5b9d\u5b9d\uff09",
        4033: "\u94c1\u5320\uff08\u5b9d\u5b9d\uff09",
        4034: "\u730e\u4eba\uff08\u5b9d\u5b9d\uff09",
        4035: "\u523a\u5ba2\uff08\u5b9d\u5b9d\uff09",
        4036: "\u9a91\u58eb\uff08\u5b9d\u5b9d\uff09",
        4037: "\u5341\u5b57\u519b\uff08\u5b9d\u5b9d\uff09",
        4038: "\u6b66\u50e7\uff08\u5b9d\u5b9d\uff09",
        4039: "\u8d24\u8005\uff08\u5b9d\u5b9d\uff09",
        4040: "\u6d41\u6c13\uff08\u5b9d\u5b9d\uff09",
        4041: "\u70bc\u91d1\u672f\u58eb\uff08\u5b9d\u5b9d\uff09",
        4042: "\u8bd7\u4eba\uff08\u5b9d\u5b9d\uff09",
        4043: "\u821e\u5a18\uff08\u5b9d\u5b9d\uff09",
        4044: "\u5341\u5b57\u519b\uff08\u5b9d\u5b9d\uff09",
        4045: "\u8d85\u7ea7\u521d\u5fc3\u8005\uff08\u5b9d\u5b9d\uff09",
        4046: "\u8dc6\u62f3\u9053",
        4047: "\u62f3\u5723",
        4048: "\u62f3\u5723",
        4049: "\u7075\u5a92",
        4050: "\u5996\u9053",
        4051: "\u6b7b\u7075\u9a91\u58eb",
        4052: "\u9ed1\u6697\u641c\u96c6\u8005",
        4054: "\u7b26\u6587\u9a91\u58eb",
        4055: "\u5927\u6cd5\u5e08",
        4056: "\u6e38\u4fa0",
        4057: "\u5927\u4e3b\u6559",
        4058: "\u673a\u5320",
        4059: "\u5341\u5b57\u5207\u5272\u8005",
        4060: "\u7b26\u6587\u9a91\u58eb",
        4061: "\u5927\u6cd5\u5e08",
        4062: "\u6e38\u4fa0",
        4063: "\u5927\u4e3b\u6559",
        4064: "\u673a\u5320",
        4065: "\u5341\u5b57\u5207\u5272\u8005",
        4066: "\u7687\u5bb6\u536b\u58eb",
        4067: "\u5143\u7d20\u4f7f",
        4068: "\u5bab\u5ef7\u4e50\u5e08",
        4069: "\u6f2b\u6e38\u821e\u8005",
        4070: "\u4fee\u7f57",
        4071: "\u57fa\u56e0\u5b66\u8005",
        4072: "\u9010\u5f71",
        4073: "\u7687\u5bb6\u536b\u58eb",
        4074: "\u5143\u7d20\u4f7f",
        4075: "\u5bab\u5ef7\u4e50\u5e08",
        4076: "\u6f2b\u6e38\u821e\u8005",
        4077: "\u4fee\u7f57",
        4078: "\u57fa\u56e0\u5b66\u8005",
        4079: "\u9010\u5f71",
        4080: "\u7b26\u6587\u9a91\u58eb",
        4081: "\u7b26\u6587\u9a91\u58eb",
        4082: "\u7687\u5bb6\u536b\u58eb",
        4083: "\u7687\u5bb6\u536b\u58eb",
        4084: "\u6e38\u4fa0",
        4085: "\u6e38\u4fa0",
        4086: "\u673a\u5320",
        4087: "\u673a\u5320",
        4096: "\u7b26\u6587\u9a91\u58eb\uff08\u5b9d\u5b9d\uff09",
        4097: "\u5927\u6cd5\u5e08\uff08\u5b9d\u5b9d\uff09",
        4098: "\u6e38\u4fa0\uff08\u5b9d\u5b9d\uff09",
        4099: "\u5927\u4e3b\u6559\uff08\u5b9d\u5b9d\uff09",
        4100: "\u673a\u5320\uff08\u5b9d\u5b9d\uff09",
        4101: "\u5341\u5b57\u5207\u5272\u8005\uff08\u5b9d\u5b9d\uff09",
        4102: "\u7687\u5bb6\u536b\u58eb\uff08\u5b9d\u5b9d\uff09",
        4103: "\u5143\u7d20\u4f7f\uff08\u5b9d\u5b9d\uff09",
        4104: "\u5bab\u5ef7\u4e50\u5e08\uff08\u5b9d\u5b9d\uff09",
        4105: "\u6f2b\u6e38\u821e\u8005\uff08\u5b9d\u5b9d\uff09",
        4106: "\u4fee\u7f57\uff08\u5b9d\u5b9d\uff09",
        4107: "\u57fa\u56e0\u5b66\u8005\uff08\u5b9d\u5b9d\uff09",
        4108: "\u9010\u5f71\uff08\u5b9d\u5b9d\uff09",
        4109: "\u7b26\u6587\u9a91\u58eb\uff08\u5b9d\u5b9d\uff09",
        4110: "\u7687\u5bb6\u536b\u58eb\uff08\u5b9d\u5b9d\uff09",
        4111: "\u6e38\u4fa0\uff08\u5b9d\u5b9d\uff09",
        4112: "\u673a\u5320\uff08\u5b9d\u5b9d\uff09",
        4190: "\u8d85\u7ea7\u521d\u5fc3\u8005",
        4191: "\u8d85\u7ea7\u521d\u5fc3\u8005\uff08\u5b9d\u5b9d\uff09",
        4211: "\u5f71\u72fc",
        4212: "\u80e7",
        4215: "Rebellion",
        4218: "\u53ec\u5524\u5e08",
      };
    l.init = function () {
      var a = this.ui,
        d = 0;
      n = a.find(".user");
      p = a.find(".pass");
      n.on("focus", function () {
        window.scrollTo(0, 0);
      });
      p.on("focus", function () {
        window.scrollTo(0, 0);
      });
      a.find(".field")
        .on("focus", "input", function () {
          e(this).parent().parent().addClass("field--focus");
        })
        .on("blur", "input", function () {
          e(this).parent().parent().removeClass("field--focus");
        });
      a.find(".field").on("change", "input", function () {
        "" != e(this).val()
          ? e(this).parent().parent().addClass("field--non-empty")
          : e(this).parent().parent().removeClass("field--non-empty");
      });
      a.find(".register").on("click", function () {
        3 == v
          ? window.open(
              "http://game.lastro.cn/?r\x3dpc/reg\x26nid\x3d3",
              "_blank",
            )
          : k.showMessageBox(
              "\u8bf7\u4f7f\u7528MF\u65b9\u5f0f\u6ce8\u518c\uff0cM\u4e3a\u7537\u6027\uff0cF\u4e3a\u5973\u6027\uff0c\u5047\u8bbe\u8d26\u53f7\u4e3atest\uff0c\u5728\u6700\u540e\u52a0\u4e0a_M(\u4e0b\u5212\u7ebfM)\uff0c\u70b9\u51fb\u767b\u5f55\u5373\u53ef\u521b\u5efa\u8d26\u53f7",
              "ok",
              null,
            );
      });
      a.find(".reg .close").on("click", function () {
        var b = a.find(".overlay.reg");
        b.animate({ opacity: 0 }, 200, function () {
          b.hide();
        });
      });
      a.find(".ck .close").on("click", function () {
        u = !1;
        var b = a.find(".overlay.ck");
        b.animate({ opacity: 0 }, 200, function () {
          b.hide();
        });
      });
      a.find(".connect").on("click", function () {
        a.find(".connect button").addClass("processing");
        c();
      });
      a.find(".exit").on("click", function () {
        b();
      });
      a.find(".radio label").on("click", function () {
        a.find(".sex_input").val($(this).find("input").val());
      });
      a.find(".reg .submit").on("click", function () {
        var b = $("#_csrf").val();
        if (!u) {
          u = !0;
          a.find(".reg .submit").addClass("processing").attr("disabled", !0);
          var c;
          switch (v) {
            case 3:
              c = {
                _csrf: b,
                "registerForm_cn2[userid]": a.find(".name input").val(),
                "registerForm_cn2[password]": a.find(".pas input").val(),
                "registerForm_cn2[repassword]": a.find(".repass input").val(),
                "registerForm_cn2[sex]": a.find(".sex_input").val(),
                "registerForm_cn2[email]": a.find(".email input").val(),
                "registerForm_cn2[verifyCode]": a.find(".idcode input").val(),
              };
              break;
            case 4:
              c = {
                _csrf: b,
                "registerForm_ts[userid]": a.find(".name input").val(),
                "registerForm_ts[password]": a.find(".pas input").val(),
                "registerForm_ts[repassword]": a.find(".repass input").val(),
                "registerForm_ts[sex]": a.find(".sex_input").val(),
                "registerForm_ts[email]": a.find(".email input").val(),
                "registerForm_ts[verifyCode]": a.find(".idcode input").val(),
              };
          }
          $.ajax({
            url: "/?r\x3dmn/register\x26nid\x3d" + v,
            type: "post",
            data: c,
            success: function (b) {
              "ok" == b
                ? ((f.ID = a.find(".name input").val()),
                  (f.PD = a.find(".repass input").val()),
                  f.save(),
                  setTimeout(function () {
                    setTimeout(function () {
                      a.find(".reg .submit")
                        .removeClass("processing")
                        .attr("disabled", !1);
                    }, 200);
                    var b = a.find(".overlay.reg");
                    b.animate({ opacity: 0 }, 200, function () {
                      b.hide();
                    });
                    a.find(".user").val(f.ID);
                    a.find(".pass").val(f.PD);
                    u = !1;
                  }, 500),
                  setTimeout(function () {
                    a.find(".reg .name input").empty();
                    a.find(".reg .pas input").empty();
                    a.find(".reg .repass input").empty();
                    a.find(".reg .email input").empty();
                    a.find(".reg .idcode input").empty();
                    alert(
                      "\u6ce8\u518c\u6210\u529f\uff0c\u8bf7\u524d\u5f80\u90ae\u7bb1\u6fc0\u6d3b\u8d26\u53f7",
                    );
                  }, 800))
                : (alert(b),
                  a
                    .find(".reg .submit")
                    .removeClass("processing")
                    .attr("disabled", !1),
                  (b = a.find("#captchaimg").attr("src")),
                  a.find("#captchaimg").attr("src", ""),
                  a.find("#captchaimg").attr("src", b + "?" + Math.random()));
              u = !1;
            },
          });
        }
      });
      a.find(".cheak").on("click", function () {
        var b = $("#_csrf").val();
        if ("" == a.find(".user").val()) a.find(".user").focus();
        else if ("" == a.find(".pass").val()) a.find(".pass").focus();
        else if (!u) {
          u = !0;
          var c;
          switch (v) {
            case 3:
              c = {
                _csrf: b,
                "Login_cn2[userid]": a.find(".user").val(),
                "Login_cn2[user_pass]": a.find(".pass").val(),
              };
              break;
            case 4:
              c = {
                _csrf: b,
                "Login_ts[userid]": a.find(".user").val(),
                "Login_ts[user_pass]": a.find(".pass").val(),
              };
              break;
            case 5:
              c = {
                _csrf: b,
                "Login_debug[userid]": a.find(".user").val(),
                "Login_debug[user_pass]": a.find(".pass").val(),
              };
          }
          a.find(".cheak button").addClass("processing");
          $.ajax({
            url: "/?r\x3dmn/search\x26nid\x3d" + v,
            type: "post",
            dataType: "json",
            data: c,
            success: function (b) {
              a.find(".cheak button").removeClass("processing");
              if (b.name) {
                f.ID = a.find(".user").val();
                f.PD = a.find(".pass").val();
                f.save();
                a.find(".updatetime").text(b.updatetime);
                a.find(".ssres_inminute").text(b.inminute);
                a.find(".ssres_name").text(b.name);
                a.find(".ssres_job").text(A[b.class]);
                a.find(".ssres_base_level").text(b.base_level);
                a.find(".ssres_job_level").text(b.job_level);
                a.find(".ssres_map").text(m.getMapName(b.last_map + ".gat"));
                a.find(".ssres_hp #hp").text(b.hp);
                a.find(".ssres_hp #max_hp").text(b.max_hp);
                a.find(".ssres_sp #sp").text(b.sp);
                a.find(".ssres_sp #max_sp").text(b.max_sp);
                a.find(".ssres_weight #weight").text(b.weight / 10);
                a.find(".ssres_weight #max_weight").text(b.maxweight / 10);
                a.find(".ssres_base_exp").text(
                  Math.round((b.base_exp / b.nextbaseexp) * 1e4) / 100 + "%",
                );
                a.find(".ssres_job_exp").text(
                  Math.round((b.job_exp / b.nextjobexp) * 1e4) / 100 + "%",
                );
                a.find(".ssres_bpower").text(b.bpower);
                b.sc_data
                  ? (a.find(".sc_time").text(b.sc_data),
                    a.find(".sc_time").parent().parent().show())
                  : a.find(".sc_time").parent().parent().hide();
                "48" == b.autoattack || "0" == b.autoattack
                  ? a.find(".ssres_zd").text("\u5426")
                  : a.find(".ssres_zd").text("\u662f");
                "48" == b.autoloot || "0" == b.autoloot
                  ? a.find(".ssres_sq").text("\u5426")
                  : a.find(".ssres_sq").text("\u662f");
                if ("48" == b.autopots || "0" == b.autopots)
                  (a.find(".ssres_cy").text("\u5426"),
                    a.find(".ssres_hpname").parent().parent().hide(),
                    a.find(".ssres_hpamount").parent().parent().hide(),
                    a.find(".ssres_hpname2").parent().parent().hide(),
                    a.find(".ssres_hpamount2").parent().parent().hide(),
                    a.find(".ssres_hpname3").parent().parent().hide(),
                    a.find(".ssres_hpamount3").parent().parent().hide(),
                    a.find(".ssres_spname").parent().parent().hide(),
                    a.find(".ssres_spamount").parent().parent().hide(),
                    a.find(".ssres_spname2").parent().parent().hide(),
                    a.find(".ssres_spamount2").parent().parent().hide(),
                    a.find(".ssres_spname3").parent().parent().hide(),
                    a.find(".ssres_spamount3").parent().parent().hide());
                else {
                  a.find(".ssres_cy").text("\u662f");
                  var c = { ITID: b.hppotion, amount: b.hpamount },
                    e = { ITID: b.hppotion2, amount: b.hpamount2 },
                    g = { ITID: b.hppotion3, amount: b.hpamount3 };
                  a.find(".ssres_hpname").text(m.getItemName(c));
                  a.find(".ssres_hpamount").text("x " + c.amount);
                  a.find(".ssres_hpname2").text(m.getItemName(e));
                  a.find(".ssres_hpamount2").text("x " + e.amount);
                  a.find(".ssres_hpname3").text(m.getItemName(g));
                  a.find(".ssres_hpamount3").text("x " + g.amount);
                  c = { ITID: b.sppotion, amount: b.spamount };
                  e = { ITID: b.sppotion2, amount: b.spamount2 };
                  g = { ITID: b.sppotion3, amount: b.spamount3 };
                  a.find(".ssres_spname").text(m.getItemName(c));
                  a.find(".ssres_spamount").text("x " + c.amount);
                  a.find(".ssres_spname2").text(m.getItemName(e));
                  a.find(".ssres_spamount2").text("x " + e.amount);
                  a.find(".ssres_spname3").text(m.getItemName(g));
                  a.find(".ssres_spamount3").text("x " + g.amount);
                }
                a.find(".ssres_cyamount").text(b.cyamount);
                0 < b.changelv &&
                  a
                    .find(".ssres_base_level")
                    .append(
                      "\x3cb style\x3d'color:red;'\x3e(+" +
                        b.changelv +
                        ")\x3c/b\x3e",
                    );
                0 < b.changejoblv &&
                  a
                    .find(".ssres_job_level")
                    .append(
                      "\x3cb style\x3d'color:red;'\x3e(+" +
                        b.changejoblv +
                        ")\x3c/b\x3e",
                    );
                0 < b.changebexp &&
                  ((d = Math.round((b.changebexp / b.nextbaseexp) * 1e4) / 100),
                  0 < d &&
                    a
                      .find(".ssres_base_exp")
                      .append(
                        "\x3cb style\x3d'color:red;'\x3e(+" +
                          d +
                          "%)\x3c/b\x3e",
                      ));
                0 < b.changejexp &&
                  ((d = Math.round((b.changejexp / b.nextjobexp) * 1e4) / 100),
                  0 < d &&
                    a
                      .find(".ssres_job_exp")
                      .append(
                        "\x3cb style\x3d'color:red;'\x3e(+" +
                          d +
                          "%)\x3c/b\x3e",
                      ));
                b.weight > 0.9 * b.maxweight
                  ? a
                      .find(".overweight")
                      .append(
                        "\x3cb style\x3d'color:red;'\x3e\u8d8590%\x3c/b\x3e",
                      )
                  : b.weight > 0.7 * b.maxweight
                    ? a
                        .find(".overweight")
                        .append(
                          "\x3cb style\x3d'color:red;'\x3e\u8d8570%\x3c/b\x3e",
                        )
                    : b.weight > 0.5 * b.maxweight &&
                      a
                        .find(".overweight")
                        .append(
                          "\x3cb style\x3d'color:red;'\x3e\u8d8550%\x3c/b\x3e",
                        );
                if (b.sjlr_rw)
                  switch (b.sjlr_rw) {
                    case 1:
                    case 4:
                      a.find(".ssres_sj_mob").text(
                        m.getmobData(b.sjlr_mob).kName,
                      );
                      a.find(".ssres_sl_mob").text(b.sjlr_sl_mob);
                      a.find(".ssres_sj_num_mob").text(b.sjlr_num_mob);
                      a.find(".ssres_sj_item").parent().parent().hide();
                      b.sjlr_num_mob == b.sjlr_sl_mob
                        ? a.find(".ssres_sj").text("\u5b8c\u6210")
                        : a.find(".ssres_sj").text("\u672a\u5b8c\u6210");
                      break;
                    case 2:
                      c = { ITID: b.sjlr_item, IsIdentified: 1 };
                      a.find(".ssres_sj_item").text(m.getItemName(c));
                      a.find(".ssres_sl_num_has_item").text(
                        b.sjlr_num_has_item,
                      );
                      a.find(".ssres_sj_num_item").text(b.sjlr_num_item);
                      a.find(".ssres_sj_mob").parent().parent().hide();
                      b.sjlr_num_has_item == b.sjlr_num_item
                        ? a.find(".ssres_sj").text("\u5b8c\u6210")
                        : a.find(".ssres_sj").text("\u672a\u5b8c\u6210");
                      break;
                    case 3:
                      (a
                        .find(".ssres_sj_mob")
                        .text(m.getmobData(b.sjlr_mob).kName),
                        a.find(".ssres_sl_mob").text(b.sjlr_sl_mob),
                        a.find(".ssres_sj_num_mob").text(b.sjlr_num_mob),
                        (c = { ITID: b.sjlr_item, IsIdentified: 1 }),
                        a.find(".ssres_sj_item").text(m.getItemName(c)),
                        a
                          .find(".ssres_sl_num_has_item")
                          .text(b.sjlr_num_has_item),
                        a.find(".ssres_sj_num_item").text(b.sjlr_num_item),
                        b.sjlr_num_mob == b.sjlr_sl_mob &&
                        b.sjlr_num_has_item == b.sjlr_num_item
                          ? a.find(".ssres_sj").text("\u5b8c\u6210")
                          : a.find(".ssres_sj").text("\u672a\u5b8c\u6210"));
                  }
                else
                  (a.find(".ssres_sj_item").parent().parent().hide(),
                    a.find(".ssres_sj_mob").parent().parent().hide(),
                    a.find(".ssres_sj").parent().parent().hide());
                a.find(".overlay.ck").show().animate({ opacity: 1 }, 200);
              } else
                1 == b
                  ? ((u = !1),
                    k.showMessageBox(
                      "\u7528\u6237\u540d\u6216\u5bc6\u7801\u9519\u8bef",
                      "ok",
                      null,
                    ))
                  : 2 == b &&
                    ((u = !1),
                    k.showMessageBox(
                      "\u8be5\u8d26\u53f7\u6ca1\u6709\u89d2\u8272\u5728\u7ebf",
                      "ok",
                      null,
                    ));
            },
          });
        }
      });
      var g = navigator.userAgent;
      if (-1 < g.indexOf("Android") || -1 < g.indexOf("Adr"))
        (a.find("input").click(function (a) {
          e("#body-cover").addClass("input");
          e("#body-cover input").val(e(this).val());
          a = e(this).attr("id");
          var b = {},
            c = document.getElementById(a),
            d = document.getElementById("InputFixed");
          Object.defineProperty(b, "name", {
            get: function () {
              return c.value;
            },
            set: function (a) {
              c.value = a;
            },
            configurable: !0,
          });
          c.oninput = function () {
            d.value = b.name;
          };
          d.oninput = function () {
            b.name = d.value;
            d.innerHTML = b.name;
          };
        }),
          e("#body-cover input").on("touchstart", function (a) {
            a.stopImmediatePropagation();
          }),
          e("#body-cover").on("touchstart", function (a) {
            a.stopImmediatePropagation();
            e(this).removeClass("input");
          }));
    };
    l.onAppend = function () {
      B = !1;
      n.val(f.saveID ? f.ID : "");
      p.val(f.saveID ? f.PD : "");
      n.val() && n.parent().parent().addClass("field--non-empty");
      p.val() && p.parent().parent().addClass("field--non-empty");
    };
    l.onRemove = function () {
      this.ui.find(".btn button").removeClass("processing");
    };
    var D = !1;
    l.onKeyDown = function (a) {
      switch (a.which) {
        case q.ENTER:
          if (!D)
            return (
              (D = !0),
              c(),
              a.stopImmediatePropagation(),
              setTimeout(function () {
                D = !1;
              }, 1e3),
              !1
            );
          break;
        case q.ESCAPE:
          return (b(), a.stopImmediatePropagation(), !1);
        case q.TAB:
          return (
            (document.activeElement === n[0] ? p : n).focus().select(),
            a.stopImmediatePropagation(),
            !1
          );
      }
      return !0;
    };
    var B = !1;
    l.onConnectionRequest = function () {};
    l.onExitRequest = function () {};
    return k.addComponent(l);
  },
);
