var commandMap = {
  ESCAPE:'ESC',
  MENU:'229',
  ESC:'LEFT_ESC',
  END:'END',
  SPACE:'SPACE',
  TAB:'TAB',
  PRINTSCREEN:'206',
  ENTER:'ENTER',
  UPARROW:'UP_ARROW',
  DOWNARROW:'DOWN_ARROW',
  LEFTARROW:'LEFT_ARROW',
  RIGHTARROW:'RIGHT_ARROW',
  UP:'UP_ARROW',
  DOWN:'DOWN_ARROW',
  LEFT:'LEFT_ARROW',
  RIGHT:'RIGHT_ARROW',
  PAGEUP:'PAGE_UP',
  PAGEDOWN:'PAGE_DOWN',
  CAPSLOCK:'CAPS_LOCK',
  DELETE:'DELETE',
  DEL:'DELETE',
  F1:'F1',
  F2:'F2',
  F3:'F3',
  F4:'F4',
  F5:'F5',
  F6:'F6',
  F7:'F7',
  F8:'F8',
  F9:'F9',
  F10:'F10',
  F11:'F11',
  F12:'F12'
};

var comboMap = {
  ALT:'LEFT_ALT',
  GUI:'LEFT_GUI',
  WINDOWS:'LEFT_GUI',
  COMMAND:'LEFT_GUI',
  CTRL:'LEFT_CTRL',
  CONTROL:'LEFT_CTRL',
  SHIFT:'LEFT_SHIFT'
};

var keyMap = {
  a:'a',
  b:'b',
  c:'c',
  d:'d',
  e:'e',
  f:'f',
  g:'g',
  h:'h',
  i:'i',
  j:'j',
  k:'k',
  l:'l',
  m:'m',
  n:'n',
  o:'o',
  p:'p',
  q:'q',
  r:'r',
  s:'s',
  t:'t',
  u:'u',
  v:'v',
  w:'w',
  x:'x',
  y:'y',
  z:'z'
};

class Duckuino {
  constructor() {
    this.keyMap = keyMap;
    this.commandMap = commandMap;
    this.comboMap = comboMap;
  }

  compile(inputCode){
    // Check if there is any code input at all
    if (inputCode == '' || inputCode == undefined)
    {
      console.error('Error: No ducky script was entered!');
      return 'Error, look at the console...';
    } 

    var parsedDucky = this.parser(inputCode);
    if (parsedDucky == '' || parsedDucky == undefined)
    {
      return 'Error, look at the console...';
    } 

    // Build the Arduino code skeleton
    return parsedDucky
  }

  // The parsing function
  parser(toParse){
    // Init chronometer
    var timerStart = Date.now();

    var parsedScript = '';

    // Trim whitespaces
    toParse = toParse.replace(/^ +| +$/gm, "");

    // Cuting the input in lines
    var lineArray = toParse.split('\n');

    // Loop every line
    for (var i = 0; i < lineArray.length; i++)
    {
      // Line empty, skip
      if (lineArray[i] === '' || lineArray[i] === '\n')
      {
        console.log('Info: Skipped line ' + (i + 1) + ', because was empty.');
        continue;
      }

      // Var who indicates to release all at the line end
      var releaseAll = false;

      // Outputs, for REPLAY/REPEAT COMMANDS
      if (parsedOut !== undefined && parsedOut !== '')
      {
        var lastLines = parsedOut;
        var lastCount = ((lastLines.split('\n')).length + 1);
      }
      var parsedOut = '';

      // Command known
      var commandKnown = false;

      // Cutting every line in words
      var wordArray = lineArray[i].split(' ');
      var wordOne = wordArray[0];

      // Handle commands
      switch(wordOne){
        case "STRING":
          wordArray.shift();

          var textString = wordArray.join(' ');

          // Replace all '"' by '\"' and all '\' by '\\'
          textString = textString.split('\\').join('\\\\').split('"').join('\\"');
          if (textString !== '')
          {
            parsedOut += '  type("' + textString + '");\n';
            commandKnown = true;
          } else {
            console.error('Error: at line: ' + (i + 1) + ', STRING needs a text');
            return;
          }
          break;
        case "DELAY":
          wordArray.shift();

          if(wordArray[0] === undefined || wordArray[0] === '') {
            console.error('Error: at line: ' + (i + 1) + ', DELAY needs a time');
            return;
          }

          if (! isNaN(wordArray[0]))
          {
            parsedOut += '  delay(' + wordArray[0] + ');\n';
            commandKnown = true;
          } else {
            console.error('Error: at line: ' + (i + 1) + ', DELAY only acceptes numbers');
            return;
          }
          break;
        case "TYPE":
          wordArray.shift();

          if(wordArray[0] === undefined || wordArray[0] === '') {
            console.error('Error: at line: ' + (i + 1) + ', TYPE needs a key');
            return;
          }

          if (keyMap[wordArray[0]] !== undefined)
          {
            commandKnown = true;
            // Replace the DuckyScript key by the Arduino key name
            parsedOut += '  type(' + keyMap[wordArray[0]] + ');\n';
          } else {
            console.error('Error: Unknown letter \'' + wordArray[0] +'\' at line: ' + (i + 1));
            return;
          }
          break;
        case "REM":
          wordArray.shift();

          // Placing the comment to arduino code
          if (wordArray[0] !== undefined && wordArray[0] !== '')
          {
            commandKnown = true;
            parsedOut += '  // ' + wordArray.join(' ') + '\n';
          } else {
            console.error('Error: at line: ' + (i + 1) + ', REM needs a comment');
            return;
          }
          break;
        case "MOUSEMOVE":
          wordArray.shift();
          if (wordArray[0] != undefined && wordArray[0] != ''){
            commandKnown = true;
            var mouseParams = wordArray[0].split(',');
            parsedOut += '  mousemove('+mouseParams[0]+', '+mouseParams[1];

            if(mouseParams[2] != undefined && mouseParams[2] != ''){
              parsedOut += ', '+mouseParams[2];
            }

            parsedOut += ');\n';
            wordArray.shift();
          } else {
            console.error('Error: at line: ' + (i + 1) + ', MOUSEMOVE requires at least two parameters')
            return;
          }
          break;       
        case "MOUSECLICK":
          wordArray.shift();
          wordArray[0] = wordArray[0].toUpperCase();

          if (wordArray[0] == 'LEFT' || wordArray[0] == 'RIGHT' || wordArray[0] == 'MIDDLE' && wordArray[0] != undefined && wordArray[0] != ''){
            commandKnown = true;
            parsedOut += '  AbsoluteMouse.click(MOUSE_'+wordArray[0]+');\n'
            wordArray.shift();
          } else {
            console.error('Error: at line: ' + (i + 1) + ', MOUSECLICK requires key (left/middle/right)')
            return;
          }
          break;
        case "REPEAT":
        case "REPLAY":
          wordArray.shift();

          if (wordArray[0] === undefined || wordArray[0] === '') {
            console.error('Error: at line: ' + (i + 1) + ', REPEAT/REPLAY needs a loop count');
            return;
          }

          if (lastLines === undefined)
          {
            console.error('Error: at line: ' + (i + 1) + ', nothing to repeat, this is the first line.');
            return;
          }

          if (! isNaN(wordArray[0]))
          {
            // Remove the lines we just created
            var linesTmp = parsedScript.split('\n');
            linesTmp.splice(-lastCount, lastCount);

            if (linesTmp.join('\n') === '')
              parsedScript = linesTmp.join('\n');
            else {
              parsedScript = linesTmp.join('\n') + '\n';
            }

            // Add two spaces at Begining
            lastLines = lastLines.replace(/^  /gm,'    ');

            // Replace them
            parsedOut += '  for(int i = 0; i < ' + wordArray[0] + '; i++) {\n';
            parsedOut += lastLines;
            parsedOut += '  }\n';

            commandKnown = true;
          } else {
            console.error('Error: at line: ' + (i + 1) + ', REPEAT/REPLAY only acceptes numbers');
            return;
          }
          break;
        default:
          if (wordArray.length == 1)
          {
            if (comboMap[wordArray[0]] !== undefined)
            {
              commandKnown = true;

              parsedOut += '  press(' + comboMap[wordArray[0]] + ');\n';
            }else if (commandMap[wordArray[0]] !== undefined) {
              commandKnown = true;

              parsedOut += '  press(' + commandMap[wordArray[0]] + ');\n';
            }else {
              commandKnown = false;
              break;
            }
            wordArray.shift();
          }
          while (wordArray.length){
            if (comboMap[wordArray[0]] !== undefined)
            {
              commandKnown = true;
              releaseAll = true;

              parsedOut += '  press(' + comboMap[wordArray[0]];
            }else if (commandMap[wordArray[0]] !== undefined) {
              commandKnown = true;
              releaseAll = true;

              parsedOut += ' ' + commandMap[wordArray[0]];
            }else if (keyMap[wordArray[0]] !== undefined) {
              commandKnown = true;
              releaseAll = true;

              parsedOut += ' ' + keyMap[wordArray[0]];
            }else {
              commandKnown = false;
              break;
            }
            wordArray.shift();
          }
      }

      if (!commandKnown)
      {
        console.error('Error: Unknown command or key \'' + wordArray[0] + '\' at line: ' + (i + 1) + '.');
        return;
      }

      // If we need to release keys, we do
      if (releaseAll)
        parsedOut += ');\n';

      parsedScript += parsedOut; // Add what we parsed
      if (i != (lineArray.length - 1))
        parsedScript += '\n'; // Add new line if not the last line
    }

    var timerEnd = Date.now();
    var timePassed = new Date(timerEnd - timerStart);

    console.log('Successfuly parsed ' + (lineArray.length) + ' lines in ' + timePassed.getMilliseconds() + 'ms');
    return parsedScript;
  }
}
