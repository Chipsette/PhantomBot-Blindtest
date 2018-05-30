(function() {
    // var areTitlesToFind = $.getSetIniDbBoolean('blindtestSettings', 'titlesMode', true),
    // areSingersToFind = $.getSetIniDbBoolean('blindtestSettings', 'singersMode', true);

    var currentPoints = {},
    countDown = $.getSetIniDbNumber('blindtestSettings', 'countDown', 120),
    maxPoints = $.getSetIniDbNumber('blindtestSettings', 'maxPoints', 10),
    halfPoints = $.getSetIniDbNumber('blindtestSettings', 'halfPoints', 5),
    currentBlindtest = {}
    currentSong = '';
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
        currentBlindtest.gameState = 2;

        //Vous avez 120 secondes pour trouver et le titre et l'interprète
        t1 = tellToCrowdatThisTime('blindtestsystem.findsong', 1);
        //Il vous reste une  minute pour trouver la chanson !
        t60 = tellToCrowdatThisTime('blindtestsystem.60left', 60);
        t30 = tellToCrowdatThisTime('blindtestsystem.30left', 30);
        t10 = tellToCrowdatThisTime('blindtestsystem.30left', 10);
        t120 = tellToCrowdatThisTime('blindtestsystem.loose', 120);

        //get the song name and singer
        currentSong = $.readFile(
               // youtubeVideo.getVideoTitle() + ' ',
               // baseFileOutputPath + 'currentsong.txt'
               '/ressources/addons/currentsong.txt'
            );
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
        $.registerChatSubcommand('blindtest', 'top5', 7);
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
        $.say('/module enable ./systems/youtubePlayer.js');
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