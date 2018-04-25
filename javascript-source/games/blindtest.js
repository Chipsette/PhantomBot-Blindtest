(function() {
    // var areTitlesToFind = $.getSetIniDbBoolean('blindtestSettings', 'titlesMode', true),
    // areSingersToFind = $.getSetIniDbBoolean('blindtestSettings', 'singersMode', true);

    var currentPoints = {},
    countDown = $.getSetIniDbNumber('blindtestSettings', 'countDown', 120),
    maxPoints = $.getSetIniDbNumber('blindtestSettings', 'maxPoints', 5);

    function blindtestUpdatePoints(user) {
        $.inidb.incr('blindtestPoints', sender, maxPoints);
    }

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
             * @commandpath adventure start - Activation of the blindtest mode (most points gained)
            */
            if (action.equalsIgnoreCase('start')) {
                $.say($.lang.get('blindtestsystem.start'));

                //TODO disable commands             
            }
            /**
             * @commandpath adventure top5 - Start the gameplay             
             * */            
            if (action.equalsIgnoreCase('begin')) {
                $.say($.lang.get('blindtestsystem.begin', 10));
            }

             /**
             * @commandpath adventure top5 - Announce the top 5 adventurers in the chat (most points gained)
             */
            if (action.equalsIgnoreCase('top5')) {
                top5();
            }
        }
     
    
    });
    $.bind('initReady', function() {
        // `script` is the script location.
        // `command` is the command name without the `!` prefix.
        // `permission` is the group number. 0, 1, 2, 3, 4, 5, 6 and 7. 
        // These are also used for the permcom command.
        // $.registerChatCommand('script', 'command', 'permission');
    
    
        // Here's what it looks like.
        $.registerChatCommand('./games/blindtest.js', 'blindtest', 7);
    });

})();