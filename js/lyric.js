(function (window) {
    function Lyric(path) {
        return new Lyric.prototype.init(path);
    }
    Lyric.prototype = {
        constructor: Lyric,
        init: function (path) {
            this.path = path;
        },
        times: [],
        lyrics: [],
        index: -1,
        loadLyric: function (callBack) {
            var $this = this;
            $.ajax({
                url:$this.path,
                dataType:"text",
                success: function (data) {
                    $this.parseLyric(data);
                    callBack();
                },
                error: function (e) {
                    console.log(e);
                }
            });
        },
        parseLyric: function (data) {
            var $this = this;
            //清空上一首歌曲的歌词信息
            $this.times = [];
            $this.lyrics = [];
            var array = data.split("[");
            //[00:00.00]正则表达式
            var timeReg = /(\d*:\d*\.\d*)\]/
            //遍历取出每一条歌词
            $.each(array,function (index,ele) {
                var res = timeReg.exec(ele);
                if(res == null) return true;
                var timeStr = res[1]; //00:00.00
                var res1 = timeStr.split(":");
                var min = parseInt(res1[0]) * 60;
                var sec = parseFloat(res1[1]);
                var time = parseFloat(Number(min + sec).toFixed(2));
                $this.times.push(time);
                var lrc = ele.split("]")[1];
                $this.lyrics.push(lrc);
            });
        },
        currentIndex: function (currentTime) {
            //获取对应时间的歌词   
            this.times.forEach((el,index,arr) => {
                if(currentTime >= el && currentTime < arr[index+1]){
                    this.index = index;
                }
            });      
            return this.index;
        }
    }
    Lyric.prototype.init.prototype = Lyric.prototype;
    window.Lyric = Lyric;
})(window);