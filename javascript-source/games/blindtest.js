(function() {
    // var areTitlesToFind = $.getSetIniDbBoolean('blindtestSettings', 'titlesMode', true),
    // areSingersToFind = $.getSetIniDbBoolean('blindtestSettings', 'singersMode', true);

    var currentPoints = {},
    countDown = $.getSetIniDbNumber('blindtestSettings', 'countDown', 120),
    maxPoints = $.getSetIniDbNumber('blindtestSettings', 'maxPoints', 10),
    halfPoints = $.getSetIniDbNumber('blindtestSettings', 'halfPoints', 5),
    halfPoints = $.getSetIniDbNumber('blindtestSettings', 'halfPoints', 5),
    currentBlindtest = {}
    ;

    function blindtestUpdatePoints(user, points) {
        $.inidb.incr('blindtestPoints', sender, points);
    }

    /**s
     * @function top5
     */
    function top5() {
        var payoutsKeys = $.inidb.GetKeyList('blindtestPoints', ''),
            temp = [],
            counter = 1,
            top5 = [],
            i;

        if (payoutsKeys.length == 0) {
            $.say($.lang.get('blindtestsystem.top5.empty'));
        }

        for (i in payoutsKeys) {
            if (payoutsKeys[i].equalsIgnoreCase($.ownerName) || payoutsKeys[i].equalsIgnoreCase($.botName)) {
                continue;
            }
            temp.push({
                username: payoutsKeys[i],
                amount: parseInt($.inidb.get('blindtestPoints', payoutsKeys[i])),
            });
        }

        temp.sort(function(a, b) {
            return (a.amount < b.amount ? 1 : -1);
        });

        for (i in temp) {
            if (counter <= 5) {
                top5.push(counter + '. ' + temp[i].username + ': ' + $.getPointsString(temp[i].amount));
                counter++;
            }
        }
        $.say($.lang.get('blindtestPoints.top5', top5.join(', ')));
    };

    /**
     * @function startBlindtest
     * @param {string} username
     */
    function startBlindtest(username) {
        currentBlindtest.gameState = 1;
        currentBlindtest.answerArray = [];
        currentBlindtest.answerArrayTMP = [];
        currentBlindtest.currentSong = [];
        currentBlindtest.answerState = 0;
      
        
        var t = setTimeout(function() {
            runBlindtest();
        }, joinTime * 1e3);
        $.say($.lang.get('blindtestsystem.begin', 10));
       // $.say($.lang.get('adventuresystem.start.success', $.resolveRank(username), $.pointNameMultiple));
    };
    
  /**
     * @function tellToCrowdatThisTime
     * 
     */
    function tellToCrowdatThisTime(msg, timeLeft) {
        var t = setTimeout(function() {
            $.say($.lang.get(msg));

        }, timeLeft);
        return t;
    };
    
    /**
     * @function runBlindtest
     */
    function runBlindtest() {
        if (currentBlindtest.gameState === 1) {
        currentBlindtest.gameState = 2;

        //launch the youtube player in 1 sec
        setTimeout($.say('/playsong 0'), 1e3);

        //Warn messages
        t1 = tellToCrowdatThisTime('blindtestsystem.findsong', 1);
        //Il vous reste une  minute pour trouver la chanson !
        t60 = tellToCrowdatThisTime('blindtestsystem.60left', countDown/2);
        t30 = tellToCrowdatThisTime('blindtestsystem.30left', 90);
        t10 = tellToCrowdatThisTime('blindtestsystem.10left', 110);
        t120 = tellToCrowdatThisTime('blindtestsystem.loose', countDown);

        //get the song name and singer
        currentBlindtest.currentSong = $.readFile(
               // youtubeVideo.getVideoTitle() + ' ',
               // baseFileOutputPath + 'currentsong.txt'
               '/ressources/addons/currentsong.txt'
            );
        }
    };

    $.bind('command', function(event) {
        // All of the default methods are stored in the event argument. You can change `event` to anything you want.
        // To access a method, in this case, you would do `event.myMethod()`.

        var sender = event.getSender().toLowerCase(),
        command = event.getCommand(),
        args = event.getArgs(),
        action = args[0];
    
        // You do not need to add the command prefix. This is already done in the bot's core in Java.
        if (command.equalsIgnoreCase('blindtest')) {
            
            // You can use the `$.say('')` function to send any message to Twitch chat.
            $.say('This is a response from my custom script!');
            // You can also use the `$.consoleLn('')` function to print messages in the bot's console.
            $.consoleLn('My custom script works!');

            /**
             * @commandpath blindtest start - Activation of the blindtest mode (most points gained)
            */
            if (action.equalsIgnoreCase('start')) {
                $.say($.lang.get('blindtestsystem.start'));       
            }
            /**
             * @commandpath blindtest begin to play - Start the gameplay
             * */            
            if (action.equalsIgnoreCase('begin')) {
                $.say($.lang.get('blindtestsystem.begin', 10));
                runBlindtest();
            }

             /**
             * @commandpath blindtest answer wrapper
             * */            
            if (action.equalsIgnoreCase('r')) {
                if (args.length == 0) {
                    $.say($.whisperPrefix(sender) + $.lang.get('blindtestsystem.command.usage'));
                    return;
                }

               if (currentSong && currentBlindtest.gameState == 2) {
                //shift words/everything between parenthesis and brackets
                answerArray = currentSong.replace('/\[(.+?)\]|\((.+?)\)+/gi', '').split('-');
                answerArrayTMP = Object.values(answerArray);
                var answerWordsCount = answerArray.count();
                var correctMatches = 0;
                //find the correct word if there is one...
                answerArrayTMP.find(function(word) {
                    //...retrieve its index inside the answer
                    var indexMatch =args.indexOf(word.trim())
                    if (indexMatch > 0) {
                        correctMatches += 1;
                        //pop the right answer from the array to match the answer left
                        answerArrayTMP = answerArrayTMP.splice(indexMatch, 1)
                    }
                });
                percentageAchievement = Math.round((correctMatches / answerWordsCount)* 100);
                if (percentageAchievement >= 75) {
                    //Stop the current song : it has been found !
                    currentBlindtest.gameState = 1;
                    currentBlindtest.answerState = 0;
                    blindtestUpdatePoints(sender, maxPoints);
                    $.say($.lang.get('blindtestsystem.win', sender, maxPoints));
                    $.say($.lang.get('blindtestsystem.win.songname', currentSong));
                    setTimeout($.say('blindtestsystem.nextsong', 5), 5e3);
                    setTimeout(runBlindtest(), 5e3);
                }
                else {
                    if (percentageAchievement >= 50) {
                        answerState === 0 ? answerState = 1 : answerState = 2;  
                        blindtestUpdatePoints(sender, halfPoints);
                        $.say($.lang.get('blindtestsystem.halfwin', sender, halfpoints));
                        //$.say($.lang.get('blindtestsystem.win.songname', currentSong));
                    }
                }
               }
            }

            if (action.equalsIgnoreCase('help')) {
                if (args.length == 0) {
                    $.say($.whisperPrefix(sender) + $.lang.get('blindtestsystem.command.usage'));
                    return;
                }
            }
             /**
             * @commandpath blindtest top5 - Announce the top 5 adventurers in the chat (most points gained)
             */
            if (action.equalsIgnoreCase('top5')) {
                top5();
            }
        }
    });

    function commandsToEnable() {
        $.registerChatCommand('./games/blindtest.js', 'blindtest', 7);
        $.registerChatSubcommand('blindtest', 'top5', 7);
        $.registerChatSubcommand('blindtest', 'start', 7);
        $.registerChatSubcommand('blindtest', 'help', 7);
        $.say($.lang.get('blindtestsystem.endinit'));

    }
    function commandsToDisable() {
        $.say('/disablecom songrequest');
        $.say('/disablecom addsong');
        $.say('/disablecom previoussong');
        $.say('/disablecom currentsong');
        $.say('/disablecom previoussong');
        $.say('/disablecom wrongsong');
        $.say('/disablecom nextsong');
    }

    function ModuleToEnable() {
        $.say($.lang.get('blindtestsystem.init'));
       // $.say('/module enable ./systems/youtubePlayer.js');
       sendCommand("module enablesilent ./systems/youtubePlayer.js");
       setTimeout(function() { doQuery(); }, 500);
    setTimeout([commandsToDisable, commandsToEnable], 2e3); //wait 2 scds before enabling/disabling commands
    }

    function ModuleToDisable() {

    }

    $.bind('initReady', function() {
        // `script` is the script location.
        // `command` is the command name without the `!` prefix.
        // `permission` is the group number. 0, 1, 2, 3, 4, 5, 6 and 7. 
        // These are also used for the permcom command.
        // $.registerChatCommand('script', 'command', 'permission');
        if ($.bot.isModuleEnabled('./systems/youtubePlayer.js')) {
            commandsToDisable();
            commandsToEnable();
        }
        else {
            ModuleToEnable();
        }
    });

})();