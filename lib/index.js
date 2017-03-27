(function () {
    //工具函数
    Util = (function () {
        var StorageGetter = function (key) {
            return localStorage.getItem(key);
        };
        var StorageSetter = function (key, val) {
            return localStorage.setItem(key, val);
        };
        var getJSONP = function (url, callback) {
            return $.jsonp({
                url: url,
                cache: true,
                callback: 'duokan_fiction_chapter',
                success: function (result) {
                    var data = $.base64.decode(result);
                    var json = decodeURIComponent(escape(data))
                    callback(json);
                }
            });
        }
        return {
            getJSONP:
            getJSONP,
            StorageGetter: StorageGetter,
            StorageSetter: StorageSetter
        }
    })();
    //一些常量
    var DOM = {
        top_nav: $('#top-nav'),
        bottom_nav: $('.bottom-nav'),
        menu_night: $('#menu_night'),
        font_container: $('.pannel_nav'),
        font_btn: $('#menu_font'),
        bg_dft: $('#bg_dft'),
        bg_orange: $('#bg_orange'),
        bg_gray: $('#bg_gray'),
        bg_green: $('#bg_green'),
        bg_black: $('#bg_black'),
        night_icon_txt: $(this.menu_night).find('.icon-txt'),
        night_flag: Util.StorageGetter('night'),    //是否夜间标识
        menu_dir: $('#menu_dir'),
        dir_list: $('#dir_list'),
        book_name: $('#fition-container').find('h4'),
    };
    //一变变量
    var Win = $(window);
    var Doc = $(document);
    var RootContainel = $('#fition-container');
    var $body = $('body');
    var bgInit; //初始背景
    var fontInitSize;   //初始字号
    var font_color;
    var chapter_id;   //章节列表
    var chapter_id_list = [];   //章节列表
    var bookName;
    var chapterTotal;

    //入口
    function init() {
        eventHanlder();
        initStyle();
        status_day();
        initFontSize();
        readerModel();
    };
    //获取章节目录
    function getChapterDir(callback) {
        //获取章节目录
        $.get('../data/chapter.json', function (data) {
            if (data.result == 0) {
              // 赋值第一章节 ID
                chapter_id = Util.StorageGetter('chapter_id');
                // 如果 Storage 里面 没有存储的章节 ID，默认从第一章开始
                if(!chapter_id){
                  chapter_id = data.chapters[1].chapter_id;
                }
                // 获取所有的章节 ID
                chapter_id_list = data.chapters;
                callback && callback();
                // 章节总数
                chapterTotal = data.chapters.length;
                // 调用渲染目录
                readDirCon(data);
            }
        }, 'json');

    };
    // 上翻页
    function prevChapter(){
      chapter_id -= 1;
    // 如果章节等于0 退出
      if(chapter_id == 0){
        chapter_id = 1;
        console.log('第一章了');
        return;
      }
      // 存储当前章节 ID
      Util.StorageSetter('chapter_id',chapter_id);

      getCurChapterCon(chapter_id,function(data){
        readerChapterCon(RootContainel,data);
      });
    };
    // 下翻页
    function nextChapter(){
      chapter_id += 1;
      // 示例只有四个章节数据所以请求大于四的时候就会退出
      if(chapter_id > chapterTotal || chapter_id >4){
        chapter_id = 4;
        console.log('最后一章了');
        return;
      };
      // 存储当前章节 ID
      Util.StorageSetter('chapter_id',chapter_id);
      getCurChapterCon(chapter_id,function(data){
        readerChapterCon(RootContainel,data);
      });


    }
    //获取当前章节内容
    function getCurChapterCon(chapter_id,callback) {
        $.get('../data/data' + chapter_id + '.json', function (data) {

            if (data.result == 0) {
                var url = data.jsonp;
                Util.getJSONP(url, function (data) {
                    callback && callback(data);
                });
            }
        }, 'json');
    };
    //阅读器数据交互方法
    function readerModel() {
        getChapterDir(function(){
          getCurChapterCon(chapter_id,function(data){
            readerChapterCon(RootContainel,data);
          })
        });
    };
    // 渲染章节内容
    function readerChapterCon(container,dataJson){

      var jsonObj = JSON.parse(dataJson);
      var tpl = '<h4>' + jsonObj.t +'</h4>';
      for (var i = 0; i < jsonObj.p.length; i++) {
        tpl+= '<p>'+jsonObj.p[i]+'</p>';
      };
      RootContainel.html(tpl);
    };

    // 渲染目录内容
    function readDirCon(data){
      var dir_tpl = '';
      bookName = data.title;
      for (var i = 0; i < chapter_id_list.length; i++) {
          dir_tpl += '<p><a href="javascript:;">' + chapter_id_list[i].title + '</a></p>';
      }
      //将模板填充到页面
      DOM.dir_list.html(dir_tpl);
      // 将书名填充到页面
    };

    //页面初始字号设置
    function initFontSize() {
        //获取存到 storage 里面的字号
        fontInitSize = Util.StorageGetter('font_size');
        fontInitSize = parseInt(fontInitSize);
        //未找到的时候设定默认字号为14
        if (!fontInitSize) {
            fontInitSize = 14;
        }
        //设置成该字号
        RootContainel.css('fontSize', fontInitSize);
    };
    //初始样式
    function initStyle() {
        font_color = Util.StorageGetter('font_color');
        //如果不存在,默认色
        if (!font_color) {
            font_color = '#555';
        }
        bgInit = Util.StorageGetter('bg_color');
        if (!bgInit) {
            bgInit = 'rgb(233, 223, 199)';
        }
    };

    //初始页面背景设置
    function status_day() {

        //如果之前是白天模式,读取白天模式的背景值
        if (!DOM.night_flag || DOM.night_flag == 'false') {
            Util.StorageSetter('night', 'false');
            //将页面文本设成夜间 显示文本和当前状态相反
            DOM.night_icon_txt.html('夜间');
            font_color = Util.StorageGetter('font_color');
            //净背景设置成读取的值
            $body.css('backgroundColor', bgInit);
            //将字体颜色设置成读取的值
            RootContainel.css('color', font_color);

        } else {    //否则读取夜间的状态的背景值
            DOM.night_icon_txt.html('白天');
            DOM.menu_night.addClass('menu-night-hover')
            bgInit = Util.StorageGetter('night_bg_color');
            font_color = Util.StorageGetter('night_font_color');
            $body.css('backgroundColor', bgInit);
            RootContainel.css('color', font_color);
        }
    };

    //交互事件绑定
    function eventHanlder() {
        //显示目录事件
        DOM.menu_dir.on('click', function () {
            DOM.dir_list.addClass('dir-fadeIn');
            DOM.dir_list.removeClass('dir-fadeOut');
        });
        DOM.dir_list.on('swipeLeft',function(){
            DOM.dir_list.removeClass('dir-fadeIn');
            DOM.dir_list.addClass('dir-fadeOut');
        })
        //唤出顶部和底部菜单。
        $('#active_mid').on('click', function () {
            if (DOM.top_nav.css('display') == 'none') {
                DOM.bottom_nav.show();
                DOM.top_nav.show();
            } else {
                DOM.bottom_nav.hide();
                DOM.top_nav.hide();
                //隐藏字号和背景面板
                DOM.font_container.hide();
                DOM.font_btn.removeClass('menu-font-hover');
            }
        });
        //滚动的时候隐藏顶部和底部菜单
        Win.scroll(function () {
            //隐藏底部菜单
            DOM.bottom_nav.hide();
            //隐藏顶部菜单
            DOM.top_nav.hide();
            //隐藏字号和背景面板
            DOM.font_container.hide();
            DOM.font_btn.removeClass('menu-font-hover');
        });
        //字体切换面板
        DOM.font_btn.on('click', function () {
            if (DOM.font_container.css('display') == 'none') {
                DOM.font_container.show();
                DOM.font_btn.addClass('menu-font-hover');
            } else {
                DOM.font_container.hide();
                DOM.font_btn.removeClass('menu-font-hover');
            }
        });
        //绑定字号变大事件
        $('#large-font').on('click', function () {
            //20号为最大字
            if (fontInitSize >= 20) {
                return
            }
            //字号增加
            fontInitSize += 1;
            RootContainel.css('fontSize', fontInitSize);
            //存储设置的字号
            Util.StorageSetter('font_size', fontInitSize);
        });
        //绑定字号变小事件
        $('#small-font').on('click', function () {
            //10号为最小字
            if (fontInitSize <= 10) {
                return
            }

            fontInitSize -= 1;
            RootContainel.css('fontSize', fontInitSize);
            //存蓄设置的字号
            Util.StorageSetter('font_size', fontInitSize);
        });
        //初始设置样式
        function setStyle(fontColor, bgColor) {
            //设置字体颜色
            RootContainel.css('color', fontColor);
            //设置背景颜色
            $body.css('backgroundColor', bgColor);
            //存储字体颜色
            Util.StorageSetter('font_color', fontColor);
            //存储设置的背景色
            Util.StorageSetter('bg_color', bgColor);
            //如果在夜间模式切换其它的背景色,将夜间模式置成 false
            Util.StorageSetter('night', 'false');
        };
        //默认背景事件
        DOM.bg_dft.on('click', function () {
            setStyle('#555', 'rgb(233, 223, 199)')
        });
        //橙色背景事件
        DOM.bg_orange.on('click', function () {
            setStyle('#555', 'rgb(247, 238, 229)')
        });

        //灰色背景事件
        DOM.bg_gray.on('click', function () {
            setStyle('#ddd', 'rgb(164, 164, 164)');
        });
        //淡绿色背景事件
        DOM.bg_green.on('click', function () {
            setStyle('#555', 'rgb(205, 239, 206)');
        });
        //黑色背景事件
        DOM.bg_black.on('click', function () {
            setStyle('#ccc', 'rgb(40, 53, 72)');
        });
        //夜间背景事件
        DOM.menu_night.on('click', function () {
            var night_now = Util.StorageGetter('night');
            var night_bg = Util.StorageGetter('night_bg_color');
            //未取到夜间背景色
            if (!night_bg) {
                night_bg = '#333'
            }
            if (night_now == 'false') {
                $body.css('backgroundColor', night_bg);
                RootContainel.css('color', '#FFF');
                DOM.night_icon_txt.html('白天');
                DOM.menu_night.addClass('menu-night-hover');
                Util.StorageSetter('night', 'true');
                Util.StorageSetter('night_bg_color', night_bg);
                Util.StorageSetter('night_font_color', '#FFF')
            } else {
                var font_color = Util.StorageGetter('font_color');
                var bgInit = Util.StorageGetter('bg_color');
                DOM.menu_night.removeClass('menu-night-hover');
                DOM.night_icon_txt.html('夜间');
                $body.css('backgroundColor', bgInit);
                RootContainel.css('color', font_color);
                Util.StorageSetter('night', 'false');
            }
        });
        // 上翻页事件
        $('#prev_btn').on('click',function(){
            prevChapter(chapter_id);
        });
        // 下翻页事件
        $('#next_btn').on('click',function(){
            nextChapter();
        });
    }
    //初始化。
    init();
})();
