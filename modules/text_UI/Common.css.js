define("text!UI/Common.css", [], function () {
  return '/* Avoid input focus border */\n:focus {outline:none;}\n::-moz-focus-inner {border:0;}\n\n* { -moz-user-select:none; }\n\nhtml, body {\n\tmargin:0;\n}\n\nbody {\n\tbackground-color:black;\n\tfont-size:12px;\n\toverflow:hidden;\n\t-webkit-user-select:none;\n\tuser-select:none;font-family:"\u5fae\u8f6f\u96c5\u9ed1", sans-serif\n}\ninput, button {outline:none;border:none;\n\tpadding: 0;background:transparent;}';
});
