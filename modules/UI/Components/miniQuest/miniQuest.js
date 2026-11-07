define(
  "UI/Components/miniQuest/miniQuest",
  "require DB/DBManager UI/UIManager UI/UIComponent UI/Components/Quest/Quest text!./miniQuest.html text!./miniQuest.css".split(
    " ",
  ),
  function (a) {
    var b = a("DB/DBManager"),
      c = a("UI/UIManager"),
      d = a("UI/UIComponent"),
      e = a("UI/Components/Quest/Quest"),
      m = a("text!./miniQuest.html");
    a = a("text!./miniQuest.css");
    var h = new d("miniQuest", m, a);
    h.mouseMode = d.MouseMode.CROSS;
    h.init = function () {};
    h.onAppend = function () {};
    h.onRemove = function () {};
    h.cleanQuset = function () {};
    h.updateQList = function () {
      var a = h.ui.find(".container .content");
      a.empty();
      if (0 == e.list.length) a.parent().hide();
      else {
        a.parent().show();
        for (var c = 0; c < e.list.length; c++) {
          var d = e.list[c],
            g = b.getQuestInfo(d.questID);
          if (g && g.display && g.show) {
            var m = "";
            switch (g.type) {
              case 1:
                m =
                  '\x3cspan style\x3d"color:#ffe500"\x3e[\u5267\u60c5]\x3c/span\x3e';
                break;
              case 2:
                m =
                  '\x3cspan style\x3d"color:#ffe500"\x3e[\u652f\u7ebf]\x3c/span\x3e';
                break;
              case 3:
                m =
                  '\x3cspan style\x3d"color:#ffe500"\x3e[\u6307\u5f15]\x3c/span\x3e';
                break;
              case 4:
                m =
                  '\x3cspan style\x3d"color:#ffe500"\x3e[\u526f\u672c]\x3c/span\x3e';
                break;
              case 5:
                m =
                  '\x3cspan style\x3d"color:#ffe500"\x3e[\u804c\u4e1a]\x3c/span\x3e';
                break;
              case 6:
                m =
                  '\x3cspan style\x3d"color:#ffe500"\x3e[\u59d4\u6258]\x3c/span\x3e';
                break;
              case 7:
                m =
                  '\x3cspan style\x3d"color:#ffe500"\x3e[\u8d4f\u91d1]\x3c/span\x3e';
            }
            a.append(
              '\x3cdiv class\x3d"task" data-questid\x3d"' +
                d.questID +
                '"\x3e\x3cp class\x3d"title"\x3e' +
                m +
                " " +
                g.name +
                '\x3c/p\x3e\x3cp class\x3d"desc"\x3e' +
                g.keyword +
                '\x3c/p class\x3d"mob"\x3e\x3cp\x3e\x3cspan class\x3d"mobname"\x3e\x3c/span\x3e\x3cspan class\x3d"mobnum"\x3e\x3c/span\x3e\x3c/p\x3e\x3c/div\x3e',
            );
            for (g = 0; g < d.count; g++) {
              var m = d.hunt[g].mobName,
                l = new Date().getTime();
              0 < d.quest_endTime && l > 1e3 * d.quest_endTime
                ? a
                    .find('.task[data-questID\x3d"' + d.questID + '"] .desc')
                    .text(
                      "\u4efb\u52a1\u5df2\u8d85\u65f6\uff0c\u8bf7\u91cd\u65b0\u9886\u53d6\u4efb\u52a1",
                    )
                : (a
                    .find('.task[data-questID\x3d"' + d.questID + '"] .mobname')
                    .text("\u6d88\u706d " + m),
                  a
                    .find('.task[data-questID\x3d"' + d.questID + '"] .mobnum')
                    .text(
                      " [ " +
                        d.hunt[g].huntCount +
                        " / " +
                        d.hunt[g].maxCount +
                        " ] " +
                        (d.hunt[g].huntCount == d.hunt[g].maxCount
                          ? "[\u5b8c\u6210]"
                          : ""),
                    ));
            }
          }
        }
      }
    };
    return c.addComponent(h);
  },
);
