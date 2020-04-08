$(function () {
//自定义滚动条
$(".content_list").mCustomScrollbar();

var $audio = $("audio");
var player = new Player($audio);
var progress;
var voiceProgress;
var lyric;

$(document).click(function () {
    
});
//加载歌曲列表
    getPlayerList();
    function getPlayerList() {
        $.ajax({
            url:"./source/musiclist.json",
            dataType:"json",
            success: function (data) {
                player.musicList = data;
                //遍历获取到的数据，创建每一条音乐
                var $musiclist = $(".content_list ul");
                $.each(data,function (index,ele) {
                    var $item =  createMusicItem(index,ele);
                    $musiclist.append($item);
                });
                initMusicInfo(data[0]);
                initMusicLyric(data[0]);
            },
            error: function (e) {
                console.log(e);
            }
        });
    }
    //初始化歌曲信息
    function initMusicInfo(music){
        //获取对应的元素
        var $musicImage = $(".song_info_pic img");
        var $musicName = $(".song_info_name a");
        var $musicSinger = $(".song_info_singer a");
        var $musicAlbum = $(".song_info_album a");
        var $musicProgressName = $(".music_progress_name");
        var $musicProgressTime = $(".music_progress_time");
        var $musicBg = $(".mask_bg");

        //给获取到的元素赋值
        $musicImage.attr("src",music.cover);
        $musicName.text(music.name);
        $musicSinger.text(music.singer);
        $musicAlbum.text(music.album);
        $musicProgressName.text(music.name +"/"+ music.singer);
        $musicProgressTime.text("00:00 / "+ music.time);
        $musicBg.css("background","url('"+music.cover+"')");
    }
    //初始化歌词信息
    function initMusicLyric(music){
        lyric = new Lyric(music.link_lrc);
        var $lyricContainer = $(".song_lyric");
        //清空上一首歌词
        $lyricContainer.html("");
        lyric.loadLyric(function () {
            //创建歌词列表
            $.each(lyric.lyrics,function (index,ele) {
                var $item = $("<li>"+ele+"</li>");
                $lyricContainer.append($item);
            });
        });
    }
    initEvents();
    function initEvents() {
        //监听歌曲的移入移出事件
        $(".content_list").delegate(".list_music","mouseenter",function () {
            $(this).find(".list_menu").stop().fadeIn(100);
            $(this).find(".list_time a").stop().fadeIn(100);
            //隐藏时长
            $(this).find(".list_time span").stop().fadeOut(100);
        });
        $(".content_list").delegate(".list_music","mouseleave",function () {
            $(this).find(".list_menu").stop().fadeOut(100);
            $(this).find(".list_time a").stop().fadeOut(100);
            //显示时长
            $(this).find(".list_time span").stop().fadeIn(100);
        });
        //监听复选框的点击事件
        $(".content_list").delegate(".list_check","click",function () {
            if($(this).parents("li").index() == 0){
                if($(this).hasClass("list_checked")){
                    $(".list_check").removeClass("list_checked");
                }else{
                    $(".list_check").addClass("list_checked");
                }
            }else{
                $(this).toggleClass("list_checked");
            }
        });

        //添加子菜单播放按钮监听
        var $musicPlay = $(".music_play");
        $(".content_list").delegate(".list_menu_play","click",function () {
            var $item = $(this).parents(".list_music");
            $(this).toggleClass("list_menu_play1");
            $item.siblings().find(".list_menu_play").removeClass("list_menu_play1");
            if($(this).attr("class").indexOf("list_menu_play1") != -1){
                $musicPlay.addClass("music_play1");
                $item.find("div").css("color","#fff");
                $item.siblings().find("div").css("color","rgba(255,255,255,0.5");
                $item.find(".list_number").addClass("list_number1");
                $item.siblings().find(".list_number").removeClass("list_number1");
            }else{
                $musicPlay.removeClass("music_play1");
                $item.find("div").css("color","rgba(255,255,255,0.5");
                $item.find(".list_number").removeClass("list_number1");
            }
            //播放音乐
            player.playMusic($item.get(0).index,$item.get(0).music);
            //切换歌曲信息
            initMusicInfo($item.get(0).music);
            //切换歌词信息
            initMusicLyric($item.get(0).music);
        });
        //收藏样式
        $(".content_list").delegate(".list_menu_shoucang","click",function () {
            $(this).toggleClass("list_menu_shoucang1");
        });
    }
    //初始化进度条
    initProgress();
    function initProgress(){
        var $progressBar = $(".music_progress_bar");
        var $progressLine = $(".music_progress_line");
        var $progressDot = $(".music_progress_dot");
        progress = Progress($progressBar,$progressLine,$progressDot);
        progress.progressClick(function (value) {
            player.musicSeekTo(value);
        });
        progress.progressMove(function (value) {
            player.musicSeekTo(value);
            $(document).off("mouseup");
        });

        var $voiceBar = $(".music_voice_bar");
        var $voiceLine = $(".music_voice_line");
        var $voiceDot = $(".music_voice_dot");
        voiceProgress = Progress($voiceBar,$voiceLine,$voiceDot);
        voiceProgress.progressClick(function (value) {
            player.musicVoiceSeekTo(value);
        });
        voiceProgress.progressMove(function (value) {
            player.musicVoiceSeekTo(value);
        });

    }

    //监听底部控制区域播放按钮的点击事件
    $(".music_play").click(function () {
        if(player.currentIndex == -1){
            //没有播放过音乐
            $(".list_music").eq(0).find(".list_menu_play").trigger("click");
        }else{
            //播放过音乐
            $(".list_music").eq(player.currentIndex).find(".list_menu_play").trigger("click");
        }
    });
    //监听底部控制区域上一首按钮的点击事件
    $(".music_pre").click(function () {
        if($(".music_mode").hasClass("music_mode1") && !$(".music_mode").hasClass("music_mode2")){
            //随机播放
            var rad = Math.random() * player.musicList.length;
            rad = parseInt(rad);
            if(rad == player.currentIndex) return;
            $(".list_music").eq(rad).find(".list_menu_play").trigger("click");
        }else if($(".music_mode").hasClass("music_mode2")){
            //单曲循环
            $(".music_progress_line").css("width",0);
            $(".music_progress_dot").css("left",0);
            var value = 0 / $(".music_progress_bar").width()
            player.musicSeekTo(value);
        }else{
            //循环播放
            $(".list_music").eq(player.preIndex()).find(".list_menu_play").trigger("click");
        }
    });
    //监听底部控制区域下一首按钮的点击事件
    $(".music_next").click(function () {
        if($(".music_mode").hasClass("music_mode1") && !$(".music_mode").hasClass("music_mode2")){
            //随机播放
            var rad = Math.random() * player.musicList.length;
            rad = parseInt(rad);
            if(rad == player.currentIndex) return;
            $(".list_music").eq(rad).find(".list_menu_play").trigger("click");
        }else if($(".music_mode").hasClass("music_mode2")){
            //单曲循环
            $(".music_progress_line").css("width",0);
            $(".music_progress_dot").css("left",0);
            var value = 0 / $(".music_progress_bar").width()
            player.musicSeekTo(value);
        }else{
            //循环播放
            $(".list_music").eq(player.nextIndex()).find(".list_menu_play").trigger("click");
        }
    });
    //监听删除按钮的点击事件
    $(".content_list").delegate(".list_menu_del","click",function () {
        var $item = $(this).parents(".list_music");
        //判断当前删除的音乐是当前播放音乐
        if($item.get(0).index == player.currentIndex){
            $(".list_music").eq(player.currentIndex + 1).find(".list_menu_play").trigger("click");
        }
        $item.remove();
        player.changeMusic($item.get(0).index);
        //重新排序
        $(".list_music").each(function (index,ele) {
            ele.index = index;
            $(ele).find(".list_number").text(index + 1);
        });
    });
    $(".music_del").click(function(lastdel){
        $(".list_music").each(function (index,ele) {
            ele.index = index;
            if($(ele).find(".list_check").hasClass("list_checked")){
                if($(ele).find(".list_menu_play").hasClass("list_menu_play1"))
                {
                    lastdel = index;
                }else{
                    $(ele).find(".list_menu_del").trigger("click");
                }
            }
        });
        if(lastdel != null){
            $(".list_music").eq(lastdel).find(".list_menu_del").trigger("click");
        }
    });
    //监听歌曲播放模式的点击事件
    $(".music_mode").click(function(){
        if($(this).hasClass("music_mode1")){
            $(this).removeClass("music_mode1");
            $(this).addClass("music_mode2");
        }else if($(this).hasClass("music_mode2")){
            $(this).removeClass("music_mode2");
        }else{
            $(this).addClass("music_mode1");
        }
    });
    //监听播放进度
    player.musicTimeUpdate(function (currentTime, duration,timeStr) {
        //同步时间
        $(".music_progress_time").text(timeStr);
        //同步进度条
        //计算播放比例
        var value = currentTime / duration * 100;
        progress.setProgress(value);
        //歌词同步
        var index = lyric.currentIndex(currentTime);
        var $item = $(".song_lyric li").eq(index);
        $item.addClass("cur");
        $item.siblings().removeClass("cur");
        if(index <= 2) return;
        $(".song_lyric").css({
            marginTop: ((-index + 2) * 30)
        });
        //播放结束切换下一首
        if(currentTime >= duration - 0.2){
            $(".music_next").trigger("click");
        }
    });
    //监听声音按钮的点击事件
    $(".music_voice_icon").click(function () {
        $(this).toggleClass("music_voice_icon1");
        if($(this).attr("class").indexOf("music_voice_icon1") != -1){
            //无声
            player.musicVoiceSeekTo(0);
        }else{
            //有声
            player.musicVoiceSeekTo(1);
        }
    });
    //定义一个方法创建一条音乐
    function createMusicItem(index,music) {
        var $item = $("                    <li class=\"list_music\">\n" +
            "                    <div class=\"list_check\"><i></i></div>\n" +
            "                    <div class=\"list_number\">"+(index + 1)+"</div>\n" +
            "                    <div class=\"list_name\">"+music.name+"" +
            "                        <div class=\"list_menu\">\n" +
            "                            <a href=\"javascript:;\" title=\"收藏\" class='list_menu_shoucang'></a>\n" +
            "                            <a href=\"javascript:;\" title=\"播放\" class='list_menu_play'></a>\n" +
            "                        </div>\n" +
            "                    </div>\n" +
            "                    <div class=\"list_singer\">"+music.singer+"</div>\n" +
            "                    <div class=\"list_time\">\n" +
            "                        <span>"+music.time+"</span>\n" +
            "                        <a href=\"javascript:;\" title=\"删除\" class='list_menu_del'></a>\n" +
            "                    </div>\n" +
            "                </li>")
        $item.get(0).index = index;
        $item.get(0).music = music;
        return $item;
    }
});