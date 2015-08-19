$(function(){
    initJplayer($('.call-record'), item.name, item.mediaUrl, item.hits, item.duration);

    function formatTimeSpanUnit(unit){
        var text = (unit || 0).toString();
        return (text.length < 2)? '0' + text: text;
    }

    function formatTimeSpan(seconds){
        var fractionals = Math.round(seconds * 100);
        seconds = Math.floor(seconds);
        fractionals -= (seconds * 100);
        var minutes = Math.floor(seconds/60);
        seconds = seconds % 60;
        var text = formatTimeSpanUnit(minutes) + ":" + formatTimeSpanUnit(seconds);
        if(fractionals != 0){
            text += '.' + fractionals;
        }
        return text;
    }

    function formatHit(hit){
        return formatTimeSpan(hit.start) + " - " + formatTimeSpan(hit.end);
    }

    var selectorCounter = 1;

    function initJplayer(selector, title, mediaUrl, hits, duration){
        var selectorId = 'searchResult' + selectorCounter ++;
        selector.attr('id', selectorId);
        var player = selector.find('.player');
        player.jPlayer({
            preload: 'none',
            cssSelectorAncestor: '#' + selectorId,
            ready: function(event) {
                player.jPlayer('setMedia', {
                    title: title,
                    mp3: mediaUrl
                });
            },
            pause: function(){
                clearTimeout(player.tm);
            },
            stop: function(){
                clearTimeout(player.tm);
            },
            swfPath: 'http://jplayer.org/latest/js'
        });
        var progress = selector.find('.jp-progress');
        var bufferOffset = 2;
        progress.find(".mark").remove();
        if(hits && hits.length > 0 && duration){
            _.forEach(hits, function(h){
                var mark = $('<div class=\'mark\'></div>');
                mark.css('left', h.start*100/duration + '%');
                progress.append(mark);
                mark.popover({
                    placement: 'bottom',
                    container: '#' + selectorId,
                    content: formatHit(h),
                    trigger: 'hover',
                    title: h.term
                });
                mark.on("click", function(){
                    var start = (h.start || 0) - bufferOffset;
                    var end = (h.end || 0) + bufferOffset;
                    if(start < 0) start = 0;
                    player.jPlayer("pauseOthers");
                    player.jPlayer("pause", 0);
                    player.jPlayer("play", start);
                    clearTimeout(player.tm);
                    player.tm = setTimeout(function(){
                        player.jPlayer("pause");
                    }, 1000*(end - start) );
                });
            });
        }
        player.jPlayer("option", "cssSelector.play", ".btn-play");
        player.jPlayer("option", "cssSelector.pause", ".btn-pause");
        player.jPlayer("option", "cssSelector.stop", ".btn-stop");
        player.jPlayer("option", "cssSelector.duration", ".duration");
        player.jPlayer("option", "cssSelector.currentTime", ".current-time");
        if(duration){
            setTimeout(function(){
                selector.find(".duration").text(formatTimeSpan(Math.floor(duration)));
            }, 200);
        }
    }
});