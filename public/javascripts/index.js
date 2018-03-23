// 网站不支持火狐及Safari浏览器
// (function(){
//     function checkNoBrowserSupport(browserName) {
//         var is = navigator.userAgent.toUpperCase().indexOf(browserName.toUpperCase()) !== -1;
//         if (is) {
//             layer.alert('本网站不支持'+browserName+'浏览器');
//             setTimeout(function () {
//                 location.href = 'http://www.google.cn/chrome/browser/desktop/index.html';
//             }, 4000);
//         }
//     }
//     checkNoBrowserSupport('fireFox');
//     // checkNoBrowserSupport('Safari');
// }());

// 浮动下划线的导航栏
+function ($) {
    function makeBottomLineFlex(time, offset) {
        $(this).find('li').on('mouseenter', function (event) {
            var left = this.offsetLeft,
                mouseX = event.clientX,
                blockLeft = $('.header-nav')[0].offsetLeft,
                mouseXOff = mouseX - blockLeft - offset,
                rightAnimateOver = {'left': left + offset},
                leftAnimateOver = {'left': left - offset},
                $bottomLine = $('.flex-bottom-line');

            $bottomLine.stop(true);

            if (left >= mouseXOff) {
                $bottomLine.animate(rightAnimateOver, time);
            } else {
                $bottomLine.stop(true).animate(leftAnimateOver, time);
            }

            $bottomLine.animate({'left': left}, 200);
        });
    }

    $.fn.makeBottomLineFlex = makeBottomLineFlex;
}(jQuery);

// 轮播图
+function ($) {

    var $container, width, height, grain, index;

    function initial(url, grain) {
        var $blockImg = $('<div class="block-img"></div>'),
            $partImg,
            partImgHeight = height / grain,
            i = 0;

        for (; i < grain; i++) {
            $partImg = $('<div class="part-img"></div>');
            $partImg.css({
                'height': partImgHeight,
                'width': 0,
                'background': "url(" + url + ") no-repeat",
                'background-size': width + 'px ' + height + 'px',
                'background-position-y': -i * partImgHeight,
                'background-position': "0 "+ -i * partImgHeight + 'px' // 兼容火狐
            }).appendTo($blockImg);
        }

        return $blockImg;
    }

    function scrollAndHide($blockImg, time) {

        var $partImages = $blockImg.find('.part-img'),
            speed = 0,
            speedIncrease = time / grain;

        $partImages.each(function () {
            $(this).animate({'width': 0, 'opacity': '0'}, speed, function () {
            });
            speed += speedIncrease;
        });
    }

    function scrollAndShow($blockImg, time) {
        var $partImages = $blockImg.find('.part-img'),
            speed = 0,
            speedIncrease = time / grain;
        $partImages.toArray().reverse().forEach(function (item) {
            $(item).animate({width: width, 'opacity': '1'}, speed);
            speed += speedIncrease;
        });
    }


    function carousel(config, callback) {

        var urls = config.urls,
            time = config.time,
            delay = config.delay,
            totalTime = time + delay,
            num = urls.length,
            index = 0,
            $blockImg,
            $blockImages,
            $animatedImg;

        $container = $(this);
        width = $(this).width();
        height = $(this).height();
        grain = config.grain;

        $container.css('position', 'relative');

        urls.forEach(function (url, i) {
            $blockImg = initial(url, grain);
            $blockImg.css({
                position: 'absolute',
                left: 0,
                top: 0
            });
            $blockImg.appendTo($container);
            if (i == 0) {
                $blockImg.find('.part-img').css('width', width);
            }
        });

        $blockImages = $container.find('.block-img');

        setInterval(function () {

            var $next = $blockImages.eq(index - 1);

            $animatedImg = $blockImages.eq(index);

            scrollAndShow($next, time);
            scrollAndHide($animatedImg, time);

            index--;

            if (index < 0) {
                index = num;
            }

            callback(index);

        }, totalTime);
    }

    $.fn.carousel = carousel;
}(jQuery);

// 文本编辑器
(function () {

    var $editor = $('.editor-container'),
        $blogEditArea = $(".blog-edit-area"),
        $htmlRenderArea = $(".html-rendering-area"),
        $dragControl = $('.drag-control'),
        html_content = '',
        height = $htmlRenderArea.height(),

        render = function () {
            html_content = markdown.toHTML($blogEditArea.val() || '');
            $htmlRenderArea.html(html_content);
            height = $htmlRenderArea.height();
            $editor.height(height + 300);
            $blogEditArea.height(height);
            $dragControl.height(height);
        };

    $editor.height(height + 300);

    if (markdown) {
        render();
        $blogEditArea.on('keyup', function () {
            render();
        });
        $blogEditArea.on('change', function () {
            render();
        });

        var dragging = 0;

        $(".new-blog-block").on("mousedown", ".drag-control", function () {
            dragging = 1;
            $(this).attr("onselectstart", "javascript:return false;");
        }).on("mousemove", function () {
            if (dragging == 1) {
                var $leftPanel = $blogEditArea,
                    $rightPanel = $htmlRenderArea,
                    rightPanelX = $rightPanel[0].offsetLeft,
                    mouseX = event.clientX,
                    dist = mouseX - rightPanelX,
                    leftPanelWidth = parseInt($leftPanel.width()),
                    rightPanelWidth = parseInt($rightPanel.width());

                if (leftPanelWidth + dist > 50) {
                    $leftPanel.css("width", leftPanelWidth + dist);
                    if (rightPanelWidth < 200) {
                        $leftPanel.css("width", leftPanelWidth);
                    }
                }
            }
        }).on("mouseleave", function () {
            dragging = 0;
        });

        $("body").on("mouseup", function () {
            dragging = 0;
        });

        // 文字处理
        // var txt = '';
        //
        // $blogEditArea.mouseup(function(){
        //     txt = window.getSelection ? window.getSelection():document.selection.createRange().text;
        // });
        //
        // $('.bold').click(function () {
        //     var newtxt = '**' + txt +'**',
        //         content = $blogEditArea.val().split(),
        //         position = content.indexOf(txt);
        //
        //     console.log(txt);
        //     alert(position);
        // })
    }
})();

// 统一事件绑定
$(function () {
    $('.header-nav').makeBottomLineFlex(300, 15);

    $('.main-pic').carousel({
        urls: ["/public/images/u2091.jpg", "/public/images/u2101.jpg", "/public/images/u2103.jpg", "/public/images/u2107.jpg", "/public/images/u2109.jpg"],
        time: 1500,
        delay: 2000,
        grain: 15
    }, function (index) {
        var $covers = $('.pic-list .cover');
        $covers.show();
        $covers.eq(index).hide();
    });

    $('.turn').click(function () {

        var $motto = $('.motto'),
            $front = $motto.find('.side').eq(0),
            $back = $motto.find('.side').eq(1),
            direct = $(this).hasClass('turn-front');

        if (direct) {
            $front = $motto.find('.side').eq(1);
            $back = $motto.find('.side').eq(0);
        }

        $front.removeClass('front-side').addClass('back-side');
        $back.removeClass('back-side').addClass('front-side');
    });

    $('.blog-card').hover(function () {
        var $img = $(this).find('.blog-pic-container');
        $img.addClass('blog-pic-container-big')
    }, function () {
        var $img = $(this).find('.blog-pic-container');
        $img.removeClass('blog-pic-container-big')
    });

    $('.nav-title').mouseenter(function () {

        var $box = $(this).parent(),
            index = $box.index(),
            $boxes = $('.navigation-box'),
            $secondBox = $boxes.eq(1),
            $thirdBox = $boxes.eq(2);

        switch (index) {
            case 0 : {
                $secondBox.animate({'left': '220px'}, 300);
                $thirdBox.animate({'left': '265px'}, 300)
            }
                break;
            case 1 : {
                $box.animate({'left': '45px'}, 300);
                $thirdBox.animate({'left': '265px'}, 300)
            }
                break;
            case 2 : {
                $secondBox.animate({'left': '45px'}, 300);
                $thirdBox.animate({'left': '90px'}, 300)
            }
                break;
        }
    });

    $('.date-title').click(function () {

        var $title = $(this),
            $dateMenu = $title.parent(),
            $submenu = $dateMenu.find('.date-submenu'),
            $icon = $title.find('.icon');


        if ($submenu.css('display') === 'none') {
            $icon.removeClass('fa-calendar-plus-o').addClass('fa-calendar-minus-o')
        } else {
            $icon.removeClass('fa-calendar-minus-o').addClass('fa-calendar-plus-o')
        }

        $submenu.slideToggle(200);
    });

    $('.blog-expand').click(function () {
        $('aside').toggle();
        $('.blog').toggleClass('blog-full-screen');
        $(this).toggleClass('fa-compress')
    });

    $('.tag').each(function () {
        var $tag = $(this),
            type = $tag.data('tagtype');

        if (type === 3) {
            $tag.addClass('tag-green')
        } else if (type === 1) {
            $tag.addClass('tag-orange')
        }
    });

    // 宠物
    (function () {
        var dialogs = [
            '主人，欢迎你<br>我是博客小助手<br>把鼠标移到我身上看看吧',
            '嘘！点击帮助栏里的<br>【博客管理】可以进入<br>快速博客管理页面',
            '点击【管理新博客】<br>可以将游客发表的博客归入系统<br>使他们能够在主页看到',
            '记得在网吧等公共环境下<br>一定要注销登录<br>否则系统会记住你的账号',
            '多么美好的一天啊，<br>加油！！<br>向着胜利前进',
            '在任意处，<br>双击鼠标<br>即可返回文件顶部！'
        ];

        var $pet = $('.pet'), $dialog = $('.pet-dialog'), time = 20000, length = dialogs.length;

        $pet.css('top', window.screen.availHeight * 0.6);

        setInterval(function () {
            $dialog.fadeOut(500, function () {
                setTimeout(function () {
                    var index = Math.floor(Math.abs(Math.random() * 10 - length));
                    $('.dialog-content').html(dialogs[index]);
                    $dialog.fadeIn(500);
                }, 10000);
            });
            time = 20000 + Math.floor(Math.random() * 1000)
        }, time);
    }());

    $('body').dblclick(function () {
        $(window).scrollTop(0)
    });

    new WOW().init();


    function lazyDownLoad() {

        var $blogList = $('.blog-list li');

        $blogList.each(function () {

            var $img = $(this).find('.blog-pic-container'),
                src = $img.data('src');

            // document.documentElement.scrollTop兼容火狐
            if (document.body.scrollTop||document.documentElement.scrollTop + document.body.clientHeight / 2 > this.offsetTop) {
                $img.css('background', 'url(' + src + ') center center');
                $img.css('background-size', '100% 100%');
            }
        });
    }

    $(document).on('scroll', lazyDownLoad);
    lazyDownLoad();

    $('.blog-list .blog-date').each(function () {
        var $container = $(this),
            date = new Date($container.find('input').val()),
            $day = $container.find('.day'),
            $month = $container.find('.month'),
            $year = $container.find('.year'),
            monthArr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Nov', 'Oct', 'Dec'];

        $day.text(date.getDate());
        $month.text(monthArr[date.getMonth()]);
        $year.text(date.getFullYear());
    });

    // $(window).scrollTop($('.head-banner')[0].offsetTop)
});




