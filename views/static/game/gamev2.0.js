/*game 2.0*/
(function () {
    var roles = [], // 游戏玩家
        total = 0, // 游戏玩家人数
        num = 0, // 动作玩家人数
        count = 0, // 一盘游戏的回合次数
        types = ['布', '布', '布', '剪刀', '剪刀', '剪刀', '锤子', '锤子', '锤子'];

    // 事件绑定
    $('#btn-start').click(function () {
        nextScene(0, 1, 1000);
    });

    $('#num-okay').click(function () {

        var $insertPlace = $('#name-okay'),
            $input_role;

        total = num = parseInt($('#role-num').val());

        if (!num) {
            alert('不要乱搞！！');
            return;
        } else if (num > 8) {
            alert('不要乱搞！！哪来那么多人');
            return;
        } else if (num === 1) {
            alert('不要乱搞！！你自己跟自己玩啊');
            return;
        }

        for (var i = 0; i < num; i++) {
            $input_role = $('<div><label class="tip">角色' + (i + 1) + '</label><input class="input role' + (i + 1) + '"></div>');
            $input_role.insertBefore($insertPlace);
        }

        nextScene(1, 2);
    });

    $('#name-okay').click(function () {

        var role,
            $trForLiving,
            $trForRecord;

        for (var j = 0; j < num; j++) {

            var checkName = $('.role' + (j + 1)).val();

            if (!checkName) {
                alert('不要乱搞，有无名氏');
                return;
            }
        }

        for (var i = 0; i < num; i++) {

            var name = $('.role' + (i + 1)).val();

            role = {};
            role.name = name; // 玩家名称
            role.index = i; // 玩家索引
            role.winTimes = 0; // 获胜次数
            role.type = '初始化'; // 表示出拳类型
            role.living = 1; // 1表示活着，0表示阵亡
            role.value = 0; // 获胜者的权重

            roles.push(role);

            // 初始化记录列表
            $trForRecord = $('<tr><td>' + name + '</td><td>0</td><td>0%</td></tr>');
            $trForRecord.appendTo($('.data'));

            // 初始化玩家列表
            $trForLiving = $('<tr><td>' + name + '</td><td><span class="remove-role" data-index="' + i + '">&times;</span></td></tr>')
            $trForLiving.appendTo($('.role-info'));
        }

        nextScene(2, 3);
        doCount(doSort);
    });

    $('.scene2').on('change', 'input', function () {

        var $currentInput = $(this),
            $inputs = $(this).parent().siblings().find('input'),
            value = $(this).val();

        $inputs.each(function () {
            if (value === $(this).val() && value !== '') {
                alert('搞事情，名字不能相同');
                $currentInput.val('');
            }
        });
    });

    $('#next').click(function () {
        doCount(decideWinner);
    });

    $('.sort').click(function () {
        doCount(doSort);
    });

    $('#show-record').click(function () {
        $('.record').show(1000);
        return false;
    });

    $('.record').click(function () {
        $(this).hide(1000);
    });

    $('body').on('keydown', function () {
        var keyCode = event.keyCode;
        if ($('.scene3').css('display') !== 'none') {
            if (keyCode === 13 || keyCode === 40 || keyCode === 32) {
                $('.next').click();
            }
        } else if ($('.scene1').css('display') !== 'none') {
            if (keyCode === 13 || keyCode === 40 || keyCode === 32) {
                $('#num-okay').click();
            }
        } else if ($('.scene0').css('display') !== 'none') {
            if (keyCode === 13 || keyCode === 40 || keyCode === 32) {
                $('#btn-start').click();
            }
        }
    });

    $('.restart').click(function () {

        var $recordTr;

        // 初始化角色状态
        roles.forEach(function (item) {
            item.winTimes = 0;
            item.living = 1;
            item.type = '初始化';
        });

        num = total; // 活动人数为总人数
        count = 0; // 初始化回合次数

        // 初始化记录表格
        for (var i = 0; i < total; i++) {
            $recordTr = $('.data').find('tr').eq(i);
            $recordTr.find('td').eq(1).text(0);
            $recordTr.find('td').eq(2).text('0%');
        }

        $('.result').empty(); // 清空结果区
        $('.role-info tr').css({'opacity': '1'}); // 初始化玩家名单

        doCount(doSort);
    });

    $('.role-info').on('click', '.remove-role', function () {
        var $tr = $(this).parent().parent(),
            index = $(this).data('index'),
            deadRole = roles[index];

        $tr.css({'opacity': 0.2});

        deadRole.living = 0;
        num--;

        console.log('num:' + num);

        if (num === 1) {
            alert('游戏结束');
            $('.restart').click();
        }
    });

    // 倒计时动画函数
    function doCount(callback) {

        var $counter = $('.counter'), //计数板
            $countDivs = $counter.find('div'),
            $div1 = $countDivs.eq(0),
            $div2 = $countDivs.eq(1),
            $div3 = $countDivs.eq(2);

        $('.result').empty();

        $div1.fadeIn(250, function () {
            $div1.fadeOut(125);
            $div2.fadeIn(250, function () {
                $div2.fadeOut(125);
                $div3.fadeIn(250, function () {
                    $div3.fadeOut(125);
                    callback();
                })
            })
        })
    }

    // 决定获胜者的算法
    function decideWinner() {
        var winners = [], // 获胜者
            losers = [], // 失败者
            type = '', // 每位选手的出拳类型
            currentTypes = [], // 每一局每人出拳类型的数组
            typesAmount = 0, // 每一局总共有多少种类型的出拳
            hammer = 0, // 是否有锤子
            cloth = 0, // 是否有布
            scissor = 0, // 是否有剪刀
            winType = ''; // 获胜的出拳类型是什么

        // 每位玩家随机出一种拳
        roles.forEach(function (role) {
            // 玩家必须存活
            if(role.living === 1) {

                var random = 9;

                while (random === 9) {
                    random = Math.floor(Math.random() * 10);
                }

                type = types[random];
                currentTypes.push(type);
                role.type = type;
            }
        });

        // 判断每一局的出拳类型数
        if (currentTypes.indexOf('剪刀') !== -1) {
            typesAmount++;
            scissor = 1;
        }
        if (currentTypes.indexOf('锤子') !== -1) {
            typesAmount++;
            hammer = 1;
        }
        if (currentTypes.indexOf('布') !== -1) {
            typesAmount++;
            cloth = 1;
        }

        // 如果出拳类型数等于2，则进行胜者判断，否则重新出拳
        if (typesAmount === 2) {
            if (cloth && hammer) {
                winType = '布';
            } else if (cloth && scissor) {
                winType = '剪刀';
            } else if (hammer && scissor) {
                winType = '锤子';
            }

            // 根据获胜类型经获胜者和失败者归组
            roles.forEach(function (role) {
                if (role.type === winType&&role.living === 1) {
                    role.value = Math.random()*10;
                    role.winTimes++;
                    winners.push(role);
                } else if(role.type !== winType&&role.living === 1){
                    losers.push(role);
                }
            });

            winners.sort(function (a, b) {
                return a.value - b.value;
            });

            winners.reverse();
            
            // console.log(winners);
            
            renderByDecide(winners,losers);
            changeRecord();
        } else {
            decideWinner();
        }
    }

    function doSort() {
        var candidates = [],
            sortedRoles = [],
            number;

        for (var i = 0; i < total; i++) {
            if (roles[i].living === 1) {
                roles[i].type = '排序';
                candidates.push({index: i, value: Math.random()})
            }
        }

        candidates.sort(function (a, b) {
            return a.value - b.value;
        });

        candidates.reverse();

        for (var j = 0; j < num; j++) {
            number = candidates[j].index;
            sortedRoles.push(roles[number]);
        }

        renderByDecide(sortedRoles);
    }

    // 改变游戏记录
    function changeRecord() {

        var $RecordTr, number;

        count++;

        for (var i = 0; i < total; i++) {
            if (roles[i].living === 1) {
                $RecordTr = $('.data').find('tr').eq(i);

                $RecordTr.find('td').eq(1).text(roles[i].winTimes); // 填写获胜次数

                number = roles[i].winTimes / count * 100;
                $RecordTr.find('td').eq(2).text(number.toFixed(2) + '%'); // 填写获胜概率
            }
        }
    }

    // 根据决策渲染获胜者
    function renderByDecide(winners, losers) {

        var $result = $('.result');

        if(losers){
            render(winners, 'success');
            render(losers, 'lose');
        }else{
            render(winners, 'common');
        }

        function  render(people, type) {
            people.forEach(function (person) {
                var $label = $('<div class="'+type+'">' + person.name + '（'+person.type+'）</div>');
                $label.appendTo($result);
            });
        }
    }

    // 下一幕
    function nextScene(preNum, nextNum, fadeTime) {

        var time = fadeTime || 300,
            $preScene = $('.scene' + preNum),
            $nextScene = $('.scene' + nextNum);

        $preScene.fadeOut(time, function () {
            $nextScene.fadeIn(time);
        })
    }

})();